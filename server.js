import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// ثقة بالـ proxy
app.set("trust proxy", true);

// قائمة جميع subdomains التي تريد تحويلها
const SUBDOMAINS = [
  "19",
  "a",
  "chico",
  "current1602",
  "current5828",
  "current6099",
  "current",
  "ola",
  "paris",
  "red.magic",
  "san",
  "yupi",
  "yupito",
  "zoro"
];

// تحويل أي طلب للبروكسي
app.get("/:subdomain/*", async (req, res) => {
  const { subdomain } = req.params;
  const path = req.params[0]; // كل البقية بعد subdomain
  const query = req.originalUrl.split("?")[1] || "";

  if (!SUBDOMAINS.includes(subdomain)) {
    return res.status(400).send("Subdomain غير مدعوم.");
  }

  const targetUrl = `http://${subdomain}.inthenameofgod.cfd/${path}${query ? "?" + query : ""}`;
  console.log("➡️ Fetching:", targetUrl);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
        "Referer": "https://www.google.com/",
        "Origin": "https://www.google.com",
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Accept-Encoding": "identity"
      },
      redirect: "manual",
      compress: false,
    });

    if (!response.ok) {
      return res.status(response.status).send(`Upstream error: ${response.status}`);
    }

    // نسخ كل الهيدرز
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.status(response.status);

    // تمرير الـ body مباشرة
    const streamBody = response.body;
    if (streamBody) streamBody.pipe(res);
    else res.send("Empty response from upstream.");
  } catch (err) {
    console.error("❌ Proxy error:", err.message);
    res.status(502).send(`Proxy error: ${err.message}`);
  }
});

app.get("/", (req, res) => res.send("✅ Proxy is running OK."));

app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
