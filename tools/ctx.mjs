import fs from "node:fs";
const h = fs.readFileSync("dist-hermana/lingolab.html", "utf8");
let i = -1, n = 0;
while ((i = h.indexOf("pwa/sw.js", i + 1)) >= 0 && n < 5) {
  n++;
  console.log("--- ocurrencia", n, "---");
  console.log(h.slice(Math.max(0, i - 120), i + 60));
}
