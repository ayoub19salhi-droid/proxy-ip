import express from "express";
import fetch from "node-fetch";

const app = express();

// استبدل هذا بالـ upstream الحقيقي
const UPSTREAM = "http://cname.cdnnet.xyz";

app.get("/*", async (req, res) => {
  const targetUrl = `${UPSTREAM}${req.originalUrl}`;
  try {
    const r = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IPTVProxy/1.0)",
        "Referer": "http://google.com",
      },
    });

    if (!r.ok) {
      res.status(r.status).send(`Upstream error: ${r.status}`);
      return;
    }

    // تمرير البث كما هو
    res.status(r.status);
    r.body.pipe(res);
  } catch (err) {
    res.status(502).send("Proxy failed: " + err.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Proxy running on ${PORT}`));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
