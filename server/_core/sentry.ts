import * as Sentry from "@sentry/node";

const SENTRY_DSN = process.env.SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("Sentry DSN not configured. Error tracking is disabled.");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Set profilesSampleRate to 1.0 to profile every transaction.
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    beforeSend(event) {
      // Filter out development errors
      if (process.env.NODE_ENV === "development") {
        console.log("Sentry event (dev mode):", event);
      }
      return event;
    },
  });

  console.log("Sentry initialized for backend");
}

export { Sentry };
