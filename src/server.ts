import net from "node:net";
import "dotenv/config";

function buildResponse(statusLine: string, body: string) {
  return `${statusLine}\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
}

function send400(socket: net.Socket, msg = "Client error") {
  const statusLine = "HTTP/1.1 400 CLIENT ERROR";
  const body = `{"message": "${msg}", "server": "${process.env.SERVER_NAME}"}`;
  socket.write(buildResponse(statusLine, body));
  socket.end();
}
const HTTP_METHODS = ["GET", "POST", "DELETE", "HEAD", "OPTIONS", "PATCH"];
const MAX_HEADER_SIZE = 8192;
const MAX_BODY_SIZE = 1048576;
let connectionsCount = 0;
const server = net.createServer((c) => {
  let rawBuffer = Buffer.alloc(0);
  let headersParsed = false;
  let contentLength = 0;
  let headerLength = 0;

  c.on("data", (chunk: Buffer) => {
    rawBuffer = Buffer.concat([rawBuffer, chunk]);

    const lineEnd = rawBuffer.indexOf("\r\n");
    if (lineEnd === -1) {
      return;
    }
    const requestLine = rawBuffer.subarray(0, lineEnd).toString("utf-8");
    const method = requestLine.split(" ")[0];
    const resource = requestLine.split(" ")[1];
    if (!method || !resource) {
      send400(c, "Method or resource not defined");
      return;
    }
    if (HTTP_METHODS.includes(method as string)) {
      console.log(`[HTTP Request Detected] Method: ${method}`);
    } else {
      send400(c, "Not a valid HTTP method");
      return;
    }

    if (!headersParsed) {
      if (
        rawBuffer.length > MAX_HEADER_SIZE &&
        rawBuffer.indexOf("\r\n\r\n") === -1
      ) {
        const statusLine = "HTTP/1.1 413 PAYLOAD TOO LARGE";
        const body = `{"message": "Header payload exceeds max size", "server": "${process.env.SERVER_NAME}"}`;
        c.write(buildResponse(statusLine, body));
        c.end();
        return;
      }
      const headerEndIndex = rawBuffer.indexOf("\r\n\r\n");
      if (headerEndIndex !== -1) {
        headersParsed = true;
        headerLength = headerEndIndex + 4; // Include the \r\n\r\n

        const headerString = rawBuffer
          .subarray(0, headerEndIndex)
          .toString("utf8");

        // Find Content-Length if it exists (for POST/PUT requests)
        const contentLengthMatch = headerString.match(
          /Content-Length:\s*(\d+)/i,
        );
        if (contentLengthMatch) {
          contentLength = parseInt(contentLengthMatch[1] as string, 10);
        }
        if (contentLength > MAX_BODY_SIZE) {
          const statusLine = "HTTP/1.1 413 PAYLOAD TOO LARGE";
          const body = `{"message": "Body exceeds max size", "server": "${process.env.SERVER_NAME}"}`;
          c.write(buildResponse(statusLine, body));
          c.end();
          return;
        }
      }
    }

    // 3. Check if the entire payload (Headers + Body) has arrived
    if (headersParsed) {
      const totalExpectedLength = headerLength + contentLength;

      if (rawBuffer.length >= totalExpectedLength) {
        processHttpRequest(c, resource);
        rawBuffer = Buffer.alloc(0);
        headersParsed = false;
        headerLength = 0;
        contentLength = 0;
      }
    }
  });
});

function processHttpRequest(socket: net.Socket, resource: string) {
  let body: string;
  let statusLine: string;

  if (resource === "/") {
    statusLine = "HTTP/1.1 200 OK";
    body = `{"message": "Hello, World!", "server": "${process.env.SERVER_NAME}"}`;
  } else {
    statusLine = "HTTP/1.1 404 NOT FOUND";
    body = `{"message": "Resource not found", "server": "${process.env.SERVER_NAME}"}`;
  }

  socket.write(buildResponse(statusLine, body));
  socket.end();
}

server.listen(process.env.PORT, () => {
  console.log(
    `${process.env.SERVER_NAME} is listening for requests on port: ${process.env.PORT}`,
  );
});

server.on("error", (err) => {
  throw err;
});

server.on("connection", () => {
  connectionsCount++;
  console.log(
    `[Connection arrived] Total connections count: ${connectionsCount}`,
  );
});

server.on("close", () => {
  console.log(`${process.env.SERVER_NAME} is closing..`);
});
