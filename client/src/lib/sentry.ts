/**
 * Sentry Error Tracking Integration
 * Set up error tracking and performance monitoring
 * 
 * To enable Sentry:
 * 1. Create account at https://sentry.io
 * 2. Create a new project for your app
 * 3. Copy your DSN (Data Source Name)
 * 4. Add it to your environment variables: VITE_SENTRY_DSN
 * 5. Uncomment the initialization code below
 */

// Example Sentry setup (uncomment and configure when ready)
/*
import * as Sentry from "@sentry/react";

export const initializeSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn("Sentry DSN not configured");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
};

export const captureMessage = (message: string, level: "info" | "warning" | "error" = "info") => {
  Sentry.captureMessage(message, level);
};
*/

// Fallback implementations for development
export const initializeSentry = () => {
  console.log("Sentry error tracking not configured. Set VITE_SENTRY_DSN to enable.");
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  console.error("Error:", error, context);
};

export const captureMessage = (message: string, level: "info" | "warning" | "error" = "info") => {
  console.log(`[${level.toUpperCase()}] ${message}`);
};
