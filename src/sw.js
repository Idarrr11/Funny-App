import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import CONFIG from "./scripts/config";

const BASE_URL = CONFIG.BASE_URL;

let baseUrl;
try {
  baseUrl = new URL(BASE_URL);
} catch (e) {
  console.warn("BASE_URL tidak valid:", BASE_URL);
  baseUrl = null;
}

// Tambahkan manifest ke precache secara manual
const manifest = self.__WB_MANIFEST;
if (Array.isArray(manifest)) {
  manifest.push({ url: "/app.webmanifest", revision: null }); // precache manifest
  precacheAndRoute(manifest);
}

// Runtime caching

// 1. Google Fonts
registerRoute(({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com", new CacheFirst({ cacheName: "google-fonts" }));

// 2. Font Awesome CDN
registerRoute(({ url }) => url.origin === "https://cdnjs.cloudflare.com" || url.origin.includes("fontawesome"), new CacheFirst({ cacheName: "fontawesome" }));

// 3. UI Avatars API
registerRoute(
  ({ url }) => url.origin === "https://ui-avatars.com",
  new CacheFirst({
    cacheName: "avatars-api",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 4. API calls (non-image)
registerRoute(({ request, url }) => baseUrl && baseUrl.origin === url.origin && request.destination !== "image", new NetworkFirst({ cacheName: "funny-api" }));

// 5. API images
registerRoute(({ request, url }) => baseUrl && baseUrl.origin === url.origin && request.destination === "image", new StaleWhileRevalidate({ cacheName: "funny-api-images" }));

// 6. Maptiler
registerRoute(({ url }) => url.origin.includes("maptiler"), new CacheFirst({ cacheName: "maptiler-api" }));

// 7. Push notification handler
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push event received");

  async function showNotification() {
    try {
      if (!event.data) {
        console.warn("Push event tanpa data");
        return;
      }

      const data = await event.data.json();

      await self.registration.showNotification(data.title, {
        body: data.options.body,
      });
    } catch (error) {
      console.error("Gagal menampilkan notifikasi:", error);
    }
  }

  event.waitUntil(showNotification());
});

// 8. Runtime cache manifest (optional fallback)
registerRoute(
  ({ url }) => url.pathname.endsWith("app.webmanifest"),
  new StaleWhileRevalidate({
    cacheName: "manifest-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  })
);
