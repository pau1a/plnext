import fs from "fs/promises";
import path from "path";

export type AnalyticsSettings = {
  ga4: {
    measurementId: string;
    enabled: boolean;
  };
};

const SETTINGS_PATH = path.join(process.cwd(), "content", "analytics-settings.json");

/**
 * Read analytics settings from file
 * Server-side only
 */
export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf8");
    const parsed = JSON.parse(raw) as AnalyticsSettings;
    return parsed;
  } catch (error) {
    console.error("Failed to read analytics settings:", error);
    // Return default settings if file doesn't exist or is invalid
    return {
      ga4: {
        measurementId: "",
        enabled: false,
      },
    };
  }
}

/**
 * Write analytics settings to file
 * Server-side only
 */
export async function writeAnalyticsSettings(settings: AnalyticsSettings): Promise<void> {
  const serialized = `${JSON.stringify(settings, null, 2)}\n`;
  const tempPath = `${SETTINGS_PATH}.tmp`;

  await fs.writeFile(tempPath, serialized, "utf8");
  await fs.rename(tempPath, SETTINGS_PATH);
}
