import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

app.set("trust proxy", true);

// Proxy endpoint for live streams or get.php
app.get("/*", async (req, res) => {
  try {
    // targetHost: كل Subdomain سيأخذ الاسم من Host header
    const targetHost = req.hostname.includes("proxy-ip.onrender.com")
      ? "19.inthenameofgod.cfd"
      : req.hostname;

    const targetUrl = `http://${targetHost}${req.originalUrl}`;

    console.log("➡️ Fetching:", targetUrl);

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        "Referer": req.headers["referer"] || "https://www.google.com/",
        "Origin": req.headers["origin"] || "https://www.google.com",
        "Accept": req.headers["accept"] || "*/*",
        "Connection": "keep-alive",
        "Accept-Encoding": "identity"
      },
      redirect: "manual",
      compress: false
    });

    console.log("⬅️ Response:", response.status, response.statusText);

    res.status(response.status);
    response.headers.forEach((v, k) => res.setHeader(k, v));

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
