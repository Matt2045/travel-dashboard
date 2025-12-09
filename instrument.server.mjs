import * as Sentry from "@sentry/react-router";
//  profiling
import { nodeProfilingIntegration } from "@sentry/profiling-node";
//  profiling
Sentry.init({
    dsn: "https://9ff539fd6fff73944852fff1cff1e454@o4509990219350016.ingest.de.sentry.io/4510041863946320",
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    //  logs
    // Enable logs to be sent to Sentry
    enableLogs: true,
    //  logs
    //  profiling
    integrations: [nodeProfilingIntegration()],
    //  profiling
    //  performance
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    //  performance
    //  profiling
    profilesSampleRate: 1.0, // profile every transaction
    //  profiling
});