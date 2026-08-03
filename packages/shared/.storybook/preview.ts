import type { Preview } from "@storybook/react";
import "../src/ui/index";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      element: "#storybook-root",
      config: {},
      options: {},
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#111827" },
      ],
    },
  },
  globalTypes: {
    locale: {
      name: "Locale",
      description: "RTL / LTR",
      defaultValue: "ar",
      toolbar: {
        icon: "globe",
        items: [
          { value: "ar", title: "العربية (RTL)", right: "→" },
          { value: "en", title: "English (LTR)", right: "→" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const dir = context.globals.locale === "ar" ? "rtl" : "ltr";
      document.documentElement.dir = dir;
      document.documentElement.lang = context.globals.locale;
      return Story();
    },
  ],
};

export default preview;
