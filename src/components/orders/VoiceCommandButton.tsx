
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import VoiceCommandDialog from './VoiceCommandDialog';

interface VoiceCommandButtonProps {
  onOrderCreated: () => void;
}

const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({ onOrderCreated }) => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setShowDialog(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Mic className="h-4 w-4" />
        Voice Command
      </Button>

      <VoiceCommandDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onOrderCreated={onOrderCreated}
      />
    </>
  );
};

export default VoiceCommandButton;
