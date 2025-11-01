"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { AnalyticsSettings } from "@/lib/analytics-settings";
import { updateAnalyticsSettingsAction } from "./actions";
import styles from "../../library/library-form.module.scss";

type AnalyticsSettingsFormState = Awaited<ReturnType<typeof updateAnalyticsSettingsAction>>;

const initialState: AnalyticsSettingsFormState = {
  status: "idle",
};

interface AnalyticsSettingsFormProps {
  initialSettings: AnalyticsSettings;
}

export function AnalyticsSettingsForm({ initialSettings }: AnalyticsSettingsFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction] = useActionState(updateAnalyticsSettingsAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      // Optionally scroll to success message or refocus
      formRef.current?.querySelector<HTMLInputElement>('input[name="measurementId"]')?.focus();
    }
  }, [state.status]);

  const errorProps = (field: keyof NonNullable<AnalyticsSettingsFormState["fieldErrors"]>) => {
    const message = state.fieldErrors?.[field];
    return {
      "aria-invalid": message ? ("true" as const) : undefined,
      "aria-describedby": message ? `${field}-error` : undefined,
      style: message
        ? {
            borderColor: "color-mix(in srgb, var(--admin-status-danger) 75%, transparent)",
            boxShadow: "0 0 0 1px color-mix(in srgb, var(--admin-status-danger) 55%, transparent)",
          }
        : undefined,
    };
  };

  return (
    <form ref={formRef} className={styles.form} action={formAction}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="analytics-measurement-id">
            Measurement ID
          </label>
          <input
            id="analytics-measurement-id"
            name="measurementId"
            className="input"
            placeholder="G-XXXXXXXXXX"
            defaultValue={initialSettings.ga4.measurementId}
            {...errorProps("measurementId")}
          />
          {state.fieldErrors?.measurementId ? (
            <p id="measurementId-error" className={styles.fieldError}>
              {state.fieldErrors.measurementId}
            </p>
          ) : (
            <p className={styles.fieldHelp}>
              Your Google Analytics 4 measurement ID (format: G-XXXXXXXXXX). Find this in your GA4 property settings.
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label
            style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", cursor: "pointer" }}
            htmlFor="analytics-enabled"
          >
            <input
              id="analytics-enabled"
              name="enabled"
              type="checkbox"
              value="true"
              defaultChecked={initialSettings.ga4.enabled}
              style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer" }}
            />
            <span className={styles.fieldLabel} style={{ margin: 0 }}>
              Enable GA4 Tracking
            </span>
          </label>
          <p className={styles.fieldHelp}>When enabled, GA4 will track pageviews and events (respects user consent).</p>
        </div>
      </div>

      <footer className={styles.footer}>
        <SubmitButton />
        {state.status === "success" ? (
          <span role="status" className={`${styles.statusMessage} ${styles.statusSuccess}`}>
            {state.message ?? "Settings saved successfully."}
          </span>
        ) : null}
        {state.status === "error" && state.message ? (
          <span role="alert" className={`${styles.statusMessage} ${styles.statusError}`}>
            {state.message}
          </span>
        ) : null}
      </footer>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="button" disabled={pending}>
      {pending ? "Saving…" : "Save Settings"}
    </button>
  );
}
