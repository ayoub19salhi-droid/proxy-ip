import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

app.set("trust proxy", true);

app.get("/live/:folder/:stream/:file", async (req, res) => {
  const { folder, stream, file } = req.params;
  const query = req.originalUrl.split("?")[1] || "";
  const targetHost = "http://cname.cdnnet.xyz";
  const targetUrl = `${targetHost}/live/${folder}/${stream}/${file}${
    query ? "?" + query : ""
  }`;

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

    console.log("⬅️ Response:", response.status, response.statusText);

    if (!response.ok) {
      return res.status(response.status).send(`Upstream error: ${response.status}`);
    }

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

