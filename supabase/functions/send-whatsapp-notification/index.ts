
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppRequest {
  procurement_request_id: string;
  supplier_id: string;
  supplier_phone: string;
  supplier_name: string;
  material_name: string;
  quantity: number;
  unit: string;
  request_number: string;
  eta?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      procurement_request_id,
      supplier_id,
      supplier_phone,
      supplier_name,
      material_name,
      quantity,
      unit,
      request_number,
      eta
    }: WhatsAppRequest = await req.json()

    // Get Twilio credentials from secrets
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      throw new Error('Missing Twilio credentials')
    }

    // Format phone number for WhatsApp (ensure it starts with +)
    const formattedPhone = supplier_phone.startsWith('+') ? supplier_phone : `+${supplier_phone}`

    // Create message content
    const messageContent = `🔔 *Procurement Request Approved*

Dear ${supplier_name},

Your procurement request has been approved:

📋 *Request #:* ${request_number}
📦 *Material:* ${material_name}
📊 *Quantity:* ${quantity} ${unit}${eta ? `\n⏰ *Expected Delivery:* ${new Date(eta).toLocaleDateString()}` : ''}

Please confirm receipt of this message and provide your expected dispatch date.

Thank you for your partnership!`

    // Send WhatsApp message via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    
    const formData = new FormData()
    formData.append('From', `whatsapp:${twilioWhatsAppNumber}`)
    formData.append('To', `whatsapp:${formattedPhone}`)
    formData.append('Body', messageContent)

    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)
    
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
      },
      body: formData
    })

    const twilioResult = await twilioResponse.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get merchant_id from the procurement request
    const { data: procurementData } = await supabase
      .from('procurement_requests')
      .select('merchant_id')
      .eq('id', procurement_request_id)
      .single()

    if (!procurementData) {
      throw new Error('Procurement request not found')
    }

    // Log the WhatsApp notification attempt
    const notificationData = {
      procurement_request_id,
      supplier_id,
      message_content: messageContent,
      status: twilioResponse.ok ? 'sent' : 'failed',
      delivery_status: twilioResult.status || 'unknown',
      error_message: twilioResponse.ok ? null : twilioResult.message || 'Unknown error',
      merchant_id: procurementData.merchant_id
    }

    const { error: insertError } = await supabase
      .from('whatsapp_notifications')
      .insert(notificationData)

    if (insertError) {
      console.error('Error logging WhatsApp notification:', insertError)
    }

    return new Response(
      JSON.stringify({
        success: twilioResponse.ok,
        message_sid: twilioResult.sid,
        status: twilioResult.status,
        error: twilioResponse.ok ? null : twilioResult.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: twilioResponse.ok ? 200 : 400
      }
    )

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
