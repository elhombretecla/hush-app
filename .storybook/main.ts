import type { StorybookConfig } from "@storybook/react-vite";

// Optional component catalogue — `npm run storybook`. Reuses vite.config.ts (React plugin + capture API).
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y", "storybook-addon-pseudo-states"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  docs: { autodocs: false },
};
export default config;
