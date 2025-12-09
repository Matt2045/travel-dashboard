import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import {sentryReactRouter, type SentryReactRouterBuildOptions} from "@sentry/react-router";


const sentryConfig: SentryReactRouterBuildOptions = {
    org: "9bbb58663a85",
    project: "travel-agency",

    // An auth token is required for uploading source maps;
    // store it in an environment variable to keep it secure.
    authToken: process.env.SENTRY_AUTH_TOKEN,
    // ...
};



export default defineConfig(config => {
    return {
        plugins: [tailwindcss(), tsconfigPaths(), reactRouter(), sentryReactRouter(sentryConfig, config)],
        sentryConfig,
        ssr: {
            noExternal:  [/@syncfusion/]
        }
    };
});
