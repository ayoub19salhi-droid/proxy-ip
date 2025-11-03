import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// حتى نعرف مصدر العميل الحقيقي
app.set("trust proxy", true);

// 🔹 1) المسار العام لأي طلب (get.php أو live/... أو أي شيء)
app.use(async (req, res) => {
  try {
    // الـ URL الأصلي الذي طلبه العميل
    const originalUrl = req.originalUrl;
    // هذا هو السيرفر الحقيقي الذي تريد تمرير الطلب إليه
    // يمكنك تغييره إن أردت.
    const targetHost = "http://cname.cdnnet.xyz";

    // نبني الرابط النهائي الذي سنطلبه من المصدر
    const targetUrl = `${targetHost}${originalUrl}`;

    console.log(`➡️ Proxying request to: ${targetUrl}`);

    // طلب إلى السيرفر الأصلي مع بعض الترويسات المشابهة للمتصفح
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

    // نرسل نفس حالة الاستجابة إلى العميل
    res.status(response.status);

    // ننسخ كل الترويسات من السيرفر الأصلي
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // نضيف ترويسة تثبت أن البروكسي هو من مرّر الطلب
    res.setHeader("X-Served-By", "proxy-ip.onrender.com");

    // إذا هناك body، نمرّره مباشرة للعميل
    if (response.body) {
      response.body.pipe(res);
    } else {
      res.send("Empty response from upstream.");
    }
  } catch (err) {
    console.error("❌ Proxy error:", err.message);
    res.status(502).send(`Proxy error: ${err.message}`);
  }
});

// صفحة افتراضية لتأكيد عمل السيرفر
app.get("/", (req, res) => {
  res.send("✅ Proxy is running and ready for all subdomains.");
});

// بدء التشغيل
app.listen(PORT, () => {
  console.log(`🚀 Proxy running on port ${PORT}`);
});
