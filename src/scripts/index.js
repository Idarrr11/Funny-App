// CSS imports
import "../styles/styles.css";
import "../styles/responsive.css";
import 'tiny-slider/dist/tiny-slider.css';
import "leaflet/dist/leaflet.css";

import App from "./pages/app";
import Camera from "./utils/camera";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
    skipLinkButton: document.getElementById("skip-link"),
  });
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();

    Camera.stopAllStreams();
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ ServiceWorker registered:", registration);
        })
        .catch((error) => {
          console.error("❌ ServiceWorker registration failed:", error);
        });
    });
  }
});
