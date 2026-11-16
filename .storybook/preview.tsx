import type { Decorator, Preview } from "@storybook/react";
import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/literata/opsz.css";
import "@fontsource-variable/literata/opsz-italic.css";
import "../src/styles/tokens/tokens.css";
import "../src/styles/global.css";
import "./preview.css";
import { StoreProvider, useStore } from "../src/app/store";
import { ToastProvider } from "../src/components/feedback/Toast";
import type { Preferences } from "../src/data/types";

/** Keeps the app store in step with the toolbar, so theme-aware components (ThemeSwitcher…) agree with the canvas. */
function ThemeSync({ theme, density }: { theme: Preferences["theme"]; density: Preferences["density"] }) {
  const { setPrefs } = useStore();
  useEffect(() => {
    setPrefs({ theme, density });
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density = density;
  }, [theme, density, setPrefs]);
  return null;
}

const withApp: Decorator = (Story, ctx) => (
  <MemoryRouter initialEntries={[ctx.parameters.route ?? "/"]}>
    <StoreProvider>
      <ToastProvider>
        <ThemeSync theme={ctx.globals.theme} density={ctx.globals.density} />
        <Story />
      </ToastProvider>
    </StoreProvider>
  </MemoryRouter>
);

const preview: Preview = {
  decorators: [withApp],
  globalTypes: {
    theme: {
      description: "Penpot Appearance theme",
      toolbar: { title: "Theme", icon: "paintbrush", items: ["paper", "night", "sepia"], dynamicTitle: true },
    },
    density: {
      description: "Penpot Density theme",
      toolbar: { title: "Density", icon: "component", items: ["comfortable", "compact"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "paper", density: "comfortable" },
  parameters: {
    layout: "padded",
    backgrounds: { disable: true },
    controls: { expanded: true },
    options: {
      storySort: {
        order: ["Penpot sync", "Brand", "01 · Buttons & Actions", "02 · Navigation", "03 · Inputs & Forms", "04 · Content Cards", "05 · Reading Components", "06 · Filters & Selection", "07 · Feedback & Overlays", "08 · Layout Patterns"],
      },
    },
    viewport: {
      viewports: {
        mobile: { name: "Mobile · 390", styles: { width: "390px", height: "844px" }, type: "mobile" },
        tablet: { name: "Tablet · 768", styles: { width: "768px", height: "1024px" }, type: "tablet" },
        desktop: { name: "Desktop · 1440", styles: { width: "1440px", height: "900px" }, type: "desktop" },
      },
    },
  },
};
export default preview;
