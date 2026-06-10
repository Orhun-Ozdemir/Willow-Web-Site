const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const html = fs.readFileSync("admin.html", "utf-8");
const js = fs.readFileSync("assets/admin.js", "utf-8");
const db = fs.readFileSync("data/content.json", "utf-8");

const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/" });
dom.window.WillowCMS = {
  fetchContent: async () => JSON.parse(db)
};

dom.window.addEventListener("error", (event) => {
  console.error("JSDOM Error:", event.error);
});
dom.window.addEventListener("unhandledrejection", (event) => {
  console.error("JSDOM Unhandled Rejection:", event.reason);
});

try {
  const scriptEl = dom.window.document.createElement("script");
  scriptEl.textContent = js;
  dom.window.document.body.appendChild(scriptEl);

  setTimeout(() => {
    const productsEl = dom.window.document.querySelector("[data-admin-products]");
    console.log("Products length in DOM:", productsEl ? productsEl.innerHTML.length : 0);
    const pagesEl = dom.window.document.querySelector("[data-admin-page-content]");
    console.log("Pages length in DOM:", pagesEl ? pagesEl.innerHTML.length : 0);
    process.exit(0);
  }, 1000);
} catch (e) {
  console.error("Caught exception:", e);
}
