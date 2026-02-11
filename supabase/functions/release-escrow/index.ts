import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[RELEASE-ESCROW] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { campaign_id } = await req.json();
    if (!campaign_id) throw new Error("Missing campaign_id");

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single();

    if (campaignError || !campaign) throw new Error("Campaign not found");

    // Only advertiser or admin can release escrow
    if (campaign.advertiser_id !== user.id) {
      // Check if admin
      const { data: roleData } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!roleData) throw new Error("Not authorized to release escrow");
    }

    if (campaign.escrow_status !== "payment_pending" && campaign.escrow_status !== "held") {
      throw new Error(`Cannot release escrow with status: ${campaign.escrow_status}`);
    }

    const creatorPayout = Number(campaign.creator_payout) || 0;
    logStep("Releasing escrow", { campaignId: campaign_id, payout: creatorPayout });

    // Update creator wallet
    const { error: walletError } = await supabase.rpc("release_escrow_to_wallet", {
      _creator_id: campaign.creator_id,
      _amount: creatorPayout,
    });

    // If RPC doesn't exist yet, do manual update
    if (walletError) {
      logStep("RPC not available, doing manual wallet update");
      const { data: wallet } = await supabase
        .from("creator_wallets")
        .select("*")
        .eq("user_id", campaign.creator_id)
        .single();

      if (wallet) {
        await supabase
          .from("creator_wallets")
          .update({
            available_balance: Number(wallet.available_balance) + creatorPayout,
            total_earned: Number(wallet.total_earned) + creatorPayout,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", campaign.creator_id);
      } else {
        await supabase.from("creator_wallets").insert({
          user_id: campaign.creator_id,
          available_balance: creatorPayout,
          total_earned: creatorPayout,
        });
      }
    }

    // Update campaign escrow status
    await supabase
      .from("campaigns")
      .update({
        escrow_status: "released",
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", campaign_id);

    // Create release transaction
    await supabase.from("transactions").insert({
      campaign_id,
      payer_id: campaign.advertiser_id,
      payee_id: campaign.creator_id,
      amount: creatorPayout,
      platform_fee: 0,
      net_amount: creatorPayout,
      type: "escrow_release",
      status: "completed",
      description: `Liberação de pagamento - ${campaign.title}`,
      completed_at: new Date().toISOString(),
    });

    logStep("Escrow released successfully");

    return new Response(
      JSON.stringify({ success: true, payout: creatorPayout }),
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
