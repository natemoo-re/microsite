importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const extFontHandler = workbox.strategies.staleWhileRevalidate({
  cacheName: "external-fonts",
  plugins: [
    new workbox.expiration.Plugin({
      maxAgeSeconds: 30 * 24 * 60 * 60
    }),
    new workbox.cacheableResponse.Plugin({
      statuses: [0, 200],
      // Automatically cleanup if quota is exceeded.
      purgeOnQuotaError: true
    })
  ]
});

workbox.routing.registerRoute(
  /https:\/\/use\.typekit\.net/,
  args => {
    return extFontHandler.handle(args);
  }
);
