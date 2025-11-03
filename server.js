import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// 🟢 إعدادات عامة — لتجاوز قيود DNS وHTTP
app.set("trust proxy", true);

// ✅ ميثود البروكسي
app.get("/live/:folder/:stream/:file", async (req, res) => {
  const { folder, stream, file } = req.params;
  const query = req.originalUrl.split("?")[1] || "";

  // 🧩 رابط السيرفر الأصلي (بدّله إن شئت)
  const targetHost = "http://cname.cdnnet.xyz";

  // 🎯 بناء الرابط النهائي
  const targetUrl = `${targetHost}/live/${folder}/${stream}/${file}${
    query ? "?" + query : ""
  }`;

  try {
    // ⚙️ إنشاء headers تحاكي متصفحًا عاديًا
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
      Referer: "https://www.google.com/",
      Origin: "https://www.google.com",
      Connection: "keep-alive",
      "Accept": "*/*",
      "Accept-Encoding": "identity", // لا ضغط لتسريع التدفق
    };

    // 🚀 تنفيذ الطلب الأصلي مباشرة (يدعم IPv4/IPv6 تلقائيًا)
    const response = await fetch(targetUrl, {
      headers,
      redirect: "manual",
      compress: false,
    });

    // 🧾 تمرير الرؤوس والبيانات كما هي
    res.status(response.status);
    response.headers.forEach((v, k) => res.setHeader(k, v));

    // إذا كان البث فيديو، نرسله كما هو
    const streamBody = response.body;
    if (streamBody) {
      streamBody.pipe(res);
    } else {
      res.send("No content from origin");
    }
  } catch (err) {
    console.error("Proxy Error:", err.message);
    res.status(502).send(`Proxy error: ${err.message}`);
  }
});

// 🧭 فحص سريع
app.get("/", (req, res) => {
  res.send("✅ Proxy IPTV is running normally.");
});

// 🚀 بدء الخادم
app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});


const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Proxy running on ${PORT}`));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
