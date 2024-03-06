const { offlineFallback, warmStrategyCache } = require('workbox-recipes');
const { CacheFirst } = require('workbox-strategies');
const { registerRoute } = require('workbox-routing');
const { CacheableResponsePlugin } = require('workbox-cacheable-response');
const { ExpirationPlugin } = require('workbox-expiration');
const { precacheAndRoute } = require('workbox-precaching/precacheAndRoute');

precacheAndRoute(self.__WB_MANIFEST);

const pageCache = new CacheFirst({
  cacheName: 'page-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

warmStrategyCache({
  urls: ['/index.html', '/'],
  strategy: pageCache,
});

registerRoute(({ request }) => request.mode === 'navigate', pageCache);

// TODO: Implement asset caching
// Define the match callback function outside the registerRoute call
function matchCallback({ request }) {
  // Array of destinations to be cached
  const destinations = ['style', 'script', 'worker'];
  return destinations.includes(request.destination);
}

// Define the caching strategy and its configuration outside the registerRoute call
const staleWhileRevalidateStrategy = new StaleWhileRevalidate({
  cacheName: 'asset-cache',
  plugins: [
    // Plugin to cache responses with specific status codes
    new CacheableResponsePlugin({ statuses: [0, 200] }),
  ],
});

// Register the route using the defined match callback and caching strategy
registerRoute(matchCallback, staleWhileRevalidateStrategy);
