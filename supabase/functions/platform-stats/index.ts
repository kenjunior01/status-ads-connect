import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    // Run all queries in parallel for speed
    const [
      profilesRes,
      campaignsRes,
      activeCampaignsRes,
      completedCampaignsRes,
      proofsRes,
      transactionsRes,
      nicheRes,
      recentCampaignsRes,
    ] = await Promise.all([
      // Total creators (profiles with display_name)
      supabase.from("profiles").select("id", { count: "exact", head: true }).not("display_name", "is", null),
      // Total campaigns
      supabase.from("campaigns").select("id, price, actual_views", { count: "exact" }),
      // Active campaigns
      supabase.from("campaigns").select("id", { count: "exact", head: true }).in("status", ["active", "in_progress", "pending"]),
      // Completed campaigns
      supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "completed"),
      // Approved proofs with view counts
      supabase.from("campaign_proofs").select("view_count").eq("status", "approved").not("view_count", "is", null),
      // Completed transactions
      supabase.from("transactions").select("amount, net_amount").eq("status", "completed"),
      // Niche distribution
      supabase.from("profiles").select("niche").not("niche", "is", null),
      // Recent campaigns (last 30 days)
      supabase.from("campaigns").select("created_at, status, price").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    ]);

    const totalCreators = profilesRes.count || 0;
    const totalCampaigns = campaignsRes.count || 0;
    const activeCampaigns = activeCampaignsRes.count || 0;
    const completedCampaigns = completedCampaignsRes.count || 0;

    // Calculate total views from approved proofs
    const totalViews = (proofsRes.data || []).reduce((sum: number, p: any) => sum + (p.view_count || 0), 0);

    // Calculate total revenue
    const totalRevenue = (transactionsRes.data || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    const totalPaidToCreators = (transactionsRes.data || []).reduce((sum: number, t: any) => sum + (t.net_amount || 0), 0);

    // Calculate total campaign value
    const totalCampaignValue = (campaignsRes.data || []).reduce((sum: number, c: any) => sum + (c.price || 0), 0);

    // Niche distribution
    const nicheCounts: Record<string, number> = {};
    (nicheRes.data || []).forEach((p: any) => {
      const niche = p.niche || "Outro";
      nicheCounts[niche] = (nicheCounts[niche] || 0) + 1;
    });
    const nicheDistribution = Object.entries(nicheCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Daily activity (last 30 days)
    const dailyActivity: Record<string, { campaigns: number; volume: number }> = {};
    (recentCampaignsRes.data || []).forEach((c: any) => {
      const day = c.created_at?.split("T")[0];
      if (day) {
        if (!dailyActivity[day]) dailyActivity[day] = { campaigns: 0, volume: 0 };
        dailyActivity[day].campaigns += 1;
        dailyActivity[day].volume += c.price || 0;
      }
    });

    const activityTimeline = Object.entries(dailyActivity)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Completion rate
    const completionRate = totalCampaigns > 0 ? Math.round((completedCampaigns / totalCampaigns) * 100) : 0;

    // Average campaign value
    const avgCampaignValue = totalCampaigns > 0 ? Math.round(totalCampaignValue / totalCampaigns) : 0;

    const stats = {
      overview: {
        total_creators: totalCreators,
        total_campaigns: totalCampaigns,
        active_campaigns: activeCampaigns,
        completed_campaigns: completedCampaigns,
        total_views: totalViews,
        total_revenue: totalRevenue,
        total_paid_to_creators: totalPaidToCreators,
        total_campaign_value: totalCampaignValue,
        completion_rate: completionRate,
        avg_campaign_value: avgCampaignValue,
      },
      niche_distribution: nicheDistribution,
      activity_timeline: activityTimeline,
      updated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[platform-stats] ERROR:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
