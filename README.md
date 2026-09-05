# Bare Web Server — Learning Project

**Goal:** Grounded understanding of web server internals by building from raw TCP (`net`) then comparing with Bun.

**Progress:** Raw `net.createServer` socket; no HTTP parsing yet.

**Plan (from todos.md):**
1. Listen for connections on a port
2. Parse HTTP requests and prepare responses (static files)
3. Error pages / error handling
4. Rebuild with Bun (`Bun.serve` likely)

**Experience level:** First time with TCP sockets / `net` module.
