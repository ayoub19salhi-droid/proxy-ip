import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

app.set("trust proxy", true);

// دالة عامة للتعامل مع أي طلب
app.use(async (req, res) => {
  const targetBase = "http://19.inthenameofgod.cfd";
  const targetUrl = targetBase + req.originalUrl;

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
    });

    console.log("⬅️ Response:", response.status, response.statusText);

    // تمرير الكود والـ headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // تمرير البث أو الملف
    const body = response.body;
    if (body) body.pipe(res);
    else res.send("Empty response from upstream.");
  } catch (err) {
    console.error("❌ Proxy error:", err.message);
    res.status(502).send(`Proxy error: ${err.message}`);
  }
});

app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));

