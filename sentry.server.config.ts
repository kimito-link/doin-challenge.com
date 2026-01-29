import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out expected errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Ignore expected errors
    if (error && typeof error === "object" && "message" in error) {
      const message = String(error.message);
      
      // Ignore network errors
      if (message.includes("NetworkError") || message.includes("ECONNREFUSED")) {
        return null;
      }

      // Ignore 404 errors
      if (message.includes("404")) {
        return null;
      }
    }

    return event;
  },
});
