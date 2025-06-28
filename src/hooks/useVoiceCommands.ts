
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProductConfigs } from '@/hooks/useProductConfigs';
import { useCustomerAutocomplete } from '@/hooks/useCustomerAutocomplete';

interface ParsedCommand {
  productCode: string;
  quantity: number;
  customerName: string;
  deliveryDate: string | null;
  specialInstructions: string | null;
  confidence: 'high' | 'medium' | 'low';
  parsedElements: {
    foundProduct: boolean;
    foundQuantity: boolean;
    foundCustomer: boolean;
    foundDate: boolean;
  };
}

export const useVoiceCommands = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const { toast } = useToast();
  const { productConfigs } = useProductConfigs();
  const { customers } = useCustomerAutocomplete();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setTranscription('');
      setParsedCommand(null);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Could not start recording. Please check microphone permissions.',
        variant: 'destructive',
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [mediaRecorder, isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      console.log('Converting audio blob to base64...');
      
      // Convert blob to array buffer first
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in smaller chunks to prevent stack overflow
      const chunkSize = 8192; // Smaller chunk size
      let base64String = '';
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        const binaryString = Array.from(chunk, byte => String.fromCharCode(byte)).join('');
        base64String += btoa(binaryString);
      }

      console.log('Audio conversion complete, sending to voice-to-text service...');
      
      // Convert speech to text
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64String }
      });

      if (transcriptionError) {
        throw new Error(transcriptionError.message);
      }

      const transcribedText = transcriptionData.text;
      setTranscription(transcribedText);
      
      console.log('Transcription:', transcribedText);
      console.log('Parsing command...');

      // Parse the command
      const { data: parsedData, error: parseError } = await supabase.functions.invoke('parse-voice-command', {
        body: {
          text: transcribedText,
          availableProducts: productConfigs.map(p => ({
            code: p.product_code,
            category: p.category,
            subcategory: p.subcategory,
            size: p.size_value,
            weightRange: p.weight_range
          })),
          availableCustomers: customers.map(c => ({
            name: c.name,
            phone: c.phone
          }))
        }
      });

      if (parseError) {
        throw new Error(parseError.message);
      }

      setParsedCommand(parsedData);
      console.log('Parsed command:', parsedData);

      toast({
        title: 'Voice Command Processed',
        description: `Transcribed: "${transcribedText.substring(0, 50)}..."`,
      });

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process voice command. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCommand = useCallback(() => {
    setTranscription('');
    setParsedCommand(null);
  }, []);

  return {
    isRecording,
    isProcessing,
    transcription,
    parsedCommand,
    startRecording,
    stopRecording,
    clearCommand,
    canRecord: !!navigator.mediaDevices?.getUserMedia
  };
};
