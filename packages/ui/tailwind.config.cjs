/** @type {import("tailwindcss").Config} */
const shared = require("@galaxy/config/tailwind");
module.exports = {
  darkMode: shared.darkMode ?? "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./.storybook/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { ...(shared.theme?.extend ?? {}) } },
  plugins: [...(shared.plugins ?? [])],
};
