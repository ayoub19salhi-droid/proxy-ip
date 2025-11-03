import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("*", async (req, res) => {
  try {
    const targetHost = "cname.cdnnet.xyz"; // السيرفر الأصلي
    const targetUrl = `http://${targetHost}${req.originalUrl}`;

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IPTVProxy/1.0)",
        "Referer": "http://google.com",
      },
    });

    res.status(response.status);
    response.body.pipe(res);
  } catch (err) {
    res.status(502).send("Proxy error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
