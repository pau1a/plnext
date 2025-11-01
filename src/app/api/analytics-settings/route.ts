import { NextResponse } from "next/server";
import { getAnalyticsSettings } from "@/lib/analytics-settings";

/**
 * GET /api/analytics-settings
 *
 * Returns public analytics configuration (GA4 measurement ID, enabled status)
 * This is called by client-side analytics vendors to get dynamic settings
 */
export async function GET() {
  try {
    const settings = await getAnalyticsSettings();

    // Return public-safe settings
    // Only return what's needed for client-side tracking
    return NextResponse.json({
      ga4: {
        measurementId: settings.ga4.measurementId || "",
        enabled: settings.ga4.enabled ?? false,
      },
    });
  } catch (error) {
    console.error("Failed to fetch analytics settings:", error);

    // Return empty settings on error (graceful degradation)
    return NextResponse.json({
      ga4: {
        measurementId: "",
        enabled: false,
      },
    });
  }
}
