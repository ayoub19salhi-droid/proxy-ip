import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// السماح بالعمل خلف أي بروكسي
app.set("trust proxy", true);

// أي رابط من أي Subdomain سيتم توجيهه
app.get("/*", async (req, res) => {
  try {
    // إعادة بناء الرابط الأصلي
    const originalUrl = req.originalUrl; // كل شيء بعد /
    const subdomainUrl = `http://19.inthenameofgod.cfd${originalUrl}`;

    console.log("➡️ Fetching:", subdomainUrl);

    const response = await fetch(subdomainUrl, {
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

    console.log("⬅️ Response:", response.status, response.statusText);

    // إعادة الرؤوس نفسها
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

// صفحة اختبار البروكسي
app.get("/", (req, res) => res.send("✅ Proxy is running OK."));

app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
