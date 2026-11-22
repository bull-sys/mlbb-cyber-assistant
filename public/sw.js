const CACHE="mlbb-cyber-v4";
const DATA_CACHE="mlbb-cyber-data-v1";
const CORE=["/","/index.html","/style.css","/app.js","/manifest.webmanifest","/icons/icon-192.png","/icons/icon-512.png"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE&&key!==DATA_CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(url.origin!==location.origin||request.method!=="GET")return;

  // Keep the latest successful game catalog available after the first online load.
  if(url.pathname==="/api/data"){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response.ok){
          const copy=response.clone();
          const cache=await caches.open(DATA_CACHE);
          await cache.put(request,copy);
        }
        return response;
      }catch(error){
        const cached=await caches.match(request);
        if(cached)return cached;
        return new Response(JSON.stringify({error:"Каталог ещё не сохранён. Подключись к интернету один раз и повтори."}),{
          status:503,
          headers:{"Content-Type":"application/json; charset=utf-8"}
        });
      }
    })());
    return;
  }

  if(url.pathname.startsWith("/api/"))return;
  event.respondWith((async()=>{
    const cached=await caches.match(request);
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response.ok){
        const copy=response.clone();
        const cache=await caches.open(CACHE);
        await cache.put(request,copy);
      }
      return response;
    }catch(error){
      return caches.match("/index.html");
    }
  })());
});
