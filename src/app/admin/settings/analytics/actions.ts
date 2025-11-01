"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/server";
import { getAnalyticsSettings, writeAnalyticsSettings, type AnalyticsSettings } from "@/lib/analytics-settings";

interface AnalyticsSettingsActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"measurementId", string>>;
}

export async function updateAnalyticsSettingsAction(
  _prevState: AnalyticsSettingsActionState,
  formData: FormData,
): Promise<AnalyticsSettingsActionState> {
  // Require admin permission
  await requirePermission("audit:read");

  const rawMeasurementId = formData.get("measurementId");
  const rawEnabled = formData.get("enabled");

  const fieldErrors: AnalyticsSettingsActionState["fieldErrors"] = {};

  const measurementId = typeof rawMeasurementId === "string" ? rawMeasurementId.trim() : "";
  const enabled = rawEnabled === "true";

  // Validate measurement ID format if provided
  if (measurementId && !measurementId.match(/^G-[A-Z0-9]+$/)) {
    fieldErrors.measurementId = "Invalid format. Must start with 'G-' followed by alphanumeric characters.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  try {
    // Read current settings
    const currentSettings = await getAnalyticsSettings();

    // Update GA4 settings
    const updatedSettings: AnalyticsSettings = {
      ...currentSettings,
      ga4: {
        measurementId,
        enabled,
      },
    };

    // Write updated settings
    await writeAnalyticsSettings(updatedSettings);

    // Revalidate relevant paths
    revalidatePath("/admin/settings/analytics");
    revalidatePath("/api/analytics-settings");

    return {
      status: "success",
      message: "Analytics settings saved successfully.",
    };
  } catch (error) {
    console.error("Failed to save analytics settings:", error);
    return {
      status: "error",
      message: "Failed to save settings. Please try again.",
    };
  }
}

export async function getAnalyticsSettingsAction() {
  // Require admin permission
  await requirePermission("audit:read");

  try {
    const settings = await getAnalyticsSettings();
    return settings;
  } catch (error) {
    console.error("Failed to fetch analytics settings:", error);
    // Return default settings on error
    return {
      ga4: {
        measurementId: "",
        enabled: false,
      },
    };
  }
}
