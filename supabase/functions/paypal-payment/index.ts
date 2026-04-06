import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_FEE_PERCENT = 18;
const PAYPAL_API_URL = "https://api-m.sandbox.paypal.com"; // Switch to live in production

const logStep = (step: string, details?: any) => {
  console.log(`[PAYPAL] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured");

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`PayPal auth error: ${data?.error_description || response.statusText}`);
  return data.access_token;
}

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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { campaign_id, creator_id, amount } = await req.json();
    if (!campaign_id || !creator_id || !amount) {
      throw new Error("Missing required fields: campaign_id, creator_id, amount");
    }

    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT) / 100;
    const creatorPayout = amount - platformFee;

    logStep("Creating PayPal order", { amount, campaignId: campaign_id });

    const accessToken = await getPayPalAccessToken();

    const origin = req.headers.get("origin") || "https://status-ads-connect.lovable.app";

    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: campaign_id,
            description: `StatusAds Campaign Payment`,
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "StatusAds Connect",
          return_url: `${origin}/advertiser-dashboard?payment=success`,
          cancel_url: `${origin}/advertiser-dashboard?payment=cancelled`,
        },
      }),
    });

    const orderData = await orderResponse.json();
    logStep("PayPal order response", { status: orderResponse.status, id: orderData?.id });

    if (!orderResponse.ok) {
      throw new Error(`PayPal order error: ${JSON.stringify(orderData?.details || orderData?.message)}`);
    }

    const approvalUrl = orderData.links?.find((l: any) => l.rel === "approve")?.href;

    // Update campaign
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

    // Create transaction
    await supabase.from("transactions").insert({
      campaign_id,
      payer_id: user.id,
      payee_id: creator_id,
      amount,
      platform_fee: platformFee,
      net_amount: creatorPayout,
      type: "escrow_hold",
      status: "pending",
      description: `Pagamento PayPal - campanha StatusAds`,
    });

    logStep("PayPal order created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderData.id,
        approval_url: approvalUrl,
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
