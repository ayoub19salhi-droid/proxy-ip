import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ اسم السيرفر الأصلي
const UPSTREAM = "http://19.inthenameofgod.cfd";

app.set("trust proxy", true);

// ✅ هذا الكود يمرر أي طلب (سواء live أو get.php أو stream …)
app.use(async (req, res) => {
  const targetUrl = UPSTREAM + req.originalUrl;

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
        "Accept-Encoding": "identity",
      },
      redirect: "manual",
      compress: false,
    });

    console.log("⬅️ Response:", response.status, response.statusText);

    res.status(response.status);
    response.headers.forEach((v, k) => res.setHeader(k, v));

    const body = response.body;
    if (body) body.pipe(res);
    else res.send("Empty response from upstream.");
  } catch (err) {
    console.error("❌ Proxy error:", err.message);
    res.status(502).send(`Proxy error: ${err.message}`);
  }
});

app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));

