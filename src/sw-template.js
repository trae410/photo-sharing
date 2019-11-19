if ('function' === typeof importScripts) {
importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

  /* global workbox */
  if (workbox) {
    console.log('Workbox is loaded');
    const {strategies} = workbox;

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([]);
     
    /* custom cache rules*/
    workbox.routing.registerNavigationRoute('/index.html', {
          blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/],
        });
     
    workbox.routing.registerRoute(
          /\.(?:png|gif|jpg|jpeg)$/,
          strategies.cacheFirst({
            cacheName: 'images',
            plugins: [
              new workbox.expiration.Plugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              }),
            ],
          })
        );


    self.addEventListener('fetch', (event) => {

      if (event.request.url.includes('firebasestorage.googleapis.com')) {
        console.log("event.request", event.request)
        // Referencing workbox.strategies will now work as expected.
        const cacheFirst = new strategies.CacheFirst({
            cacheName: 'images2',
            plugins: [
              new workbox.expiration.Plugin({
                maxEntries: 30,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              }),
            ],
          });
        event.respondWith(cacheFirst.makeRequest({request: event.request}));
      }
    });

  } else {
      console.log('Workbox could not be loaded. No Offline support');
  }
}