# web server

Build a minimal HTTP server from a raw TCP socket using Node's net module to understand the HTTP protocol and web servers at a low level.

---

## Plan

> Build the same bare HTTP web server twice, the second time using Bun.

### roadmap: completed

1. ✅ Listen for reqs on a port
2. ✅ Parse reqs and prepare the according response (static files for now — basic JSON responses)
3. ⏸ Error pages and handle errors (404 response exists; need guard for partial chunks / undefined resource)

### roadmap: todos

- error handling
- handle forever bytes with no headers w/ max buffer size
- set idle timeout
- persistent connections using Connection: keep-alive
- Fix partial-chunk guard (`resource` undefined when chunk splits before space)
- Track connection close (`end` event) without hardcoding
- Add `Content-Length` to responses (done — verify)
- Serve static files (read from disk based on `resource`)
- Rebuild with Bun (`Bun.serve` comparison)
