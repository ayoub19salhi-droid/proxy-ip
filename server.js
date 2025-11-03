import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

app.set("trust proxy", true);

// ✅ اختبار بسيط لتأكيد عمل البروكسي
app.get("/test-proxy-ping", (req, res) => {
  res.setHeader("X-Served-By", "proxy-ip.onrender.com");
  res.json({
    ok: true,
    servedBy: "proxy-ip.onrender.com",
    yourIp: req.ip,
  });
});

// ✅ بروكسي لمسارات /get.php (ملفات m3u)
app.get("/get.php", async (req, res) => {
  const query = req.originalUrl.split("?")[1] || "";
  const targetHost = "http://cname.cdnnet.xyz";
  const targetUrl = `${targetHost}/get.php?${query}`;

  console.log("➡️ [get.php] Request from", req.ip, "->", targetUrl);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
        "Referer": "https://www.google.com/",
        "Origin": "https://www.google.com",
        "Accept": "*/*",
        "Connection": "keep-alive",
      },
      redirect: "manual",
      compress: false,
    });

    res.status(response.status);
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    // علامة البروكسي
    res.setHeader("X-Served-By", "proxy-ip.onrender.com");

    if (!response.ok) {
      return res.send(`Upstream error: ${response.status}`);
    }

    const body = response.body;
    if (body) body.pipe(res);
    else res.send("Empty response from upstream.");
  } catch (err) {
    console.error("❌ Proxy error [get.php]:", err.message);
    res.status(502).send(`Proxy error: ${err.message}`);
  }
});

// ✅ بروكسي لمسارات /live/...
app.get("/live/:folder/:stream/:file", async (req, res) => {
  const { folder, stream, file } = req.params;
  const query = req.originalUrl.split("?")[1] || "";
  const targetHost = "http://cname.cdnnet.xyz";
  const targetUrl = `${targetHost}/live/${folder}/${stream}/${file}${
    query ? "?" + query : ""
  }`;

  console.log("➡️ [live] Request from", req.ip, "->", targetUrl);

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

    res.status(response.status);
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    // علامة البروكسي
    res.setHeader("X-Served-By", "proxy-ip.onrender.com");

    if (!response.ok) {
      return res.send(`Upstream error: ${response.status}`);
    }

    const body = response.body;
    if (body) body.pipe(res);
    else res.send("Empty response from upstream.");
  } catch (err) {
    console.error("❌ Proxy error [live]:", err.message);
    res.status(502).send(`Proxy error: ${err.message}`);
  }
});

app.get("/", (req, res) =>
  res.send("✅ Proxy is running OK. Use /test-proxy-ping to verify.")
);

app.listen(PORT, () =>
  console.log(`🚀 Proxy running on port ${PORT}`)
);
