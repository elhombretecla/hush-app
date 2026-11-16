import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming/create";

addons.setConfig({
  theme: create({ base: "light", brandTitle: "hush. — UI Kit & Components", fontBase: '"Inter Variable", system-ui, sans-serif' }),
  sidebar: { showRoots: true },
});
