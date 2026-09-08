#!/usr/bin/env node
/* Assemble src/ en un index.html autonome. Aucun bundler, aucune dépendance. */
const fs = require("fs"), path = require("path");
const R = path.join(__dirname, "..");
const rd = (p) => fs.readFileSync(path.join(R, p), "utf8");

const order = JSON.parse(rd("src/order.json"));
const js = order.map((f) => {
  const body = rd(path.join("src", f)).replace(/\s+$/, "");
  return `/* ─────────── ${f} ─────────── */\n${body}`;
}).join("\n\n");

const html =
  `<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n` +
  `<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">\n` +
  // Politique de securite : rien ne se charge ni ne se connecte hors de cette liste.
  `<meta http-equiv="Content-Security-Policy" content="` + [
    "default-src 'none'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data:",
    "media-src 'self' blob: mediastream:",
    "connect-src 'self' https://0.peerjs.com wss://0.peerjs.com wss://*.peerjs.com",
    "object-src 'none'", "base-uri 'none'", "form-action 'none'",
    "worker-src 'self' blob:"
  ].join("; ") + `">\n` +
  `<style>html{color-scheme:dark}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n` +
  rd("src/head.html").trim() + "\n\n<style>\n" + rd("src/style.css").trim() + "\n</style>\n" +
  `</head>\n<body>\n` +
  rd("src/body.html").trim() + "\n\n" +
  rd("src/vendor.html").trim() + "\n" +
  `<script>\n"use strict";\n(function(){\n${js}\n})();\n</script>\n` +
  `</body>\n</html>\n`;

fs.writeFileSync(path.join(R, "index.html"), html);
fs.writeFileSync(path.join(R, "game.js"), `"use strict";\n(function(){\n${js}\n})();\n`);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`index.html assemblé — ${order.length} modules, ${kb} Ko`);
