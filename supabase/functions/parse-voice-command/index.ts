
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, availableProducts, availableCustomers } = await req.json();

    if (!text) {
      throw new Error('No text provided for parsing');
    }

    console.log('Parsing voice command:', text);

    const systemPrompt = `You are a voice command parser for an order management system. Parse the given text and extract order information.

Available products: ${JSON.stringify(availableProducts.slice(0, 20))} (showing first 20)
Available customers: ${JSON.stringify(availableCustomers.slice(0, 20))} (showing first 20)

Parse the voice command and return a JSON object with the following structure:
{
  "productCode": "exact product code if found, or best match",
  "quantity": number,
  "customerName": "customer name mentioned",
  "deliveryDate": "YYYY-MM-DD format or null",
  "specialInstructions": "any special notes or null",
  "confidence": "high/medium/low based on how certain you are about the parsing",
  "parsedElements": {
    "foundProduct": boolean,
    "foundQuantity": boolean,
    "foundCustomer": boolean,
    "foundDate": boolean
  }
}

Examples:
- "Create order for AGR Super Heavy Pile 10-inch 35 grams quantity 100 for KN Jewellers delivery 7th July"
- "Add 50 pieces of Gold Ring size 8 for customer ABC Jewellers by tomorrow"
- "Order 25 Silver Chain 20 inch for Raj Jewellery deliver next week"

Focus on extracting:
1. Product details (category, subcategory, size, weight)
2. Quantity (pieces, units, etc.)
3. Customer name
4. Delivery date (convert relative dates like "tomorrow", "next week" to actual dates)
5. Any special instructions

Current date context: ${new Date().toISOString().split('T')[0]}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI parsing error:', errorText);
      throw new Error(`Failed to parse command: ${errorText}`);
    }

    const result = await response.json();
    const parsedCommand = JSON.parse(result.choices[0].message.content);
    
    console.log('Command parsed successfully:', parsedCommand);

    return new Response(
      JSON.stringify(parsedCommand),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Command parsing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
