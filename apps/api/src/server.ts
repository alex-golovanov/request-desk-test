import { createApp } from "./app";

const app = createApp();
const webBuild = new URL("../../web/dist/", import.meta.url);

const server = Bun.serve({
  hostname: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.API_PORT ?? process.env.PORT ?? 3000),
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/api/")) return app.handle(request);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    const asset = /^\/assets\/[\w.-]+$/.test(pathname);
    if (pathname !== "/" && !asset) return new Response("Not found", { status: 404 });

    const file = Bun.file(new URL(asset ? pathname.slice(1) : "index.html", webBuild));
    if (!(await file.exists())) {
      return new Response(asset ? "Not found" : "Run bun run build to serve the web app.", {
        status: 404,
      });
    }

    return new Response(request.method === "HEAD" ? null : file, {
      headers: { "Content-Type": file.type },
    });
  },
});

console.log(`Request Desk listening at ${server.url}`);
