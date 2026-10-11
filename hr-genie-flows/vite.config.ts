import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// index.html is the dev page (pick an agent with ?flow=). creche.html and
// leave.html pin one agent each; they're what the portfolio embeds.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { index: "index.html", creche: "creche.html", leave: "leave.html" },
    },
  },
});
