import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_FEE_PERCENT = 18;
const PAYSUITE_API_URL = "https://api.paysuite.co.mz";

const logStep = (step: string, details?: any) => {
  console.log(`[PAYSUITE] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const paysuiteApiKey = Deno.env.get("PAYSUITE_API_KEY");
    if (!paysuiteApiKey) throw new Error("PAYSUITE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { campaign_id, creator_id, amount, phone } = await req.json();
    if (!campaign_id || !creator_id || !amount || !phone) {
      throw new Error("Missing required fields: campaign_id, creator_id, amount, phone");
    }

    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT) / 100;
    const creatorPayout = amount - platformFee;

    logStep("Initiating M-Pesa payment", { amount, phone, campaignId: campaign_id });

    // Call PaySuite API to initiate M-Pesa payment
    const paysuiteResponse = await fetch(`${PAYSUITE_API_URL}/v1/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paysuiteApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount.toFixed(2),
        currency: "MZN",
        phone_number: `258${phone}`,
        reference: `STATUSADS-${campaign_id.substring(0, 8)}`,
        description: `Pagamento campanha StatusAds`,
        callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/paysuite-webhook`,
      }),
    });

    const paysuiteData = await paysuiteResponse.json();
    logStep("PaySuite response", { status: paysuiteResponse.status, data: paysuiteData });

    if (!paysuiteResponse.ok) {
      throw new Error(`PaySuite error: ${paysuiteData?.message || paysuiteResponse.statusText}`);
    }

    // Update campaign with escrow info
    await supabase
      .from("campaigns")
      .update({
        escrow_status: "payment_pending",
        escrow_amount: amount,
        platform_fee: platformFee,
        creator_payout: creatorPayout,
        publish_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", campaign_id);

    // Create transaction record
    await supabase.from("transactions").insert({
      campaign_id,
      payer_id: user.id,
      payee_id: creator_id,
      amount,
      platform_fee: platformFee,
      net_amount: creatorPayout,
      type: "escrow_hold",
      status: "pending",
      description: `Pagamento M-Pesa - campanha StatusAds`,
    });

    logStep("Payment initiated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: paysuiteData?.transaction_id || paysuiteData?.id,
        message: "Confirme o pagamento no seu telefone",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
