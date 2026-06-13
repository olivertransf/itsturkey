/**
 * Next 12 bundles jsonwebtoken against Node's `buffer` module, which expects
 * SlowBuffer (removed in Node 24+). Polyfill before Next loads.
 */
const buffer = require("buffer");

if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}
