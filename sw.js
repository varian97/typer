const cacheVersion = "v1";

const addResourcesToCache = async (resources) => {
  const cache = await caches.open(cacheVersion);
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open(cacheVersion);
  await cache.put(request, response);
};

const deleteCache = async (key) => {
  await caches.delete(key);
};

const deleteOldCaches = async () => {
  const cacheKeepList = [cacheVersion];
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
  await Promise.all(cachesToDelete.map(deleteCache));
};

const handleFetch = async ({ request, event }) => {
  const cache = await caches.open(cacheVersion);
  const cachedData = await cache.match(request);

  if (cachedData) {
    return cachedData;
  }

  try {
    const res = await fetch(request);
    event.waitUntil(putInCache(request, res.clone()));

    return res;
  } catch (err) {
    console.error(`failed to load ${request}: ${err}`);
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

self.addEventListener("install", (e) => {
  e.waitUntil(
    addResourcesToCache([
      "/typer/",
      "/typer/index.html",
      "/typer/index.css",
      "/typer/index.js",
      "/typer/typer.png",
    ])
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(handleFetch({ request: e.request, event: e }));
});
