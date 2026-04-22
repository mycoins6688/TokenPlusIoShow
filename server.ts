import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// API 路由占位 (如果以后需要)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 静态文件服务
const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

// 处理 SPA 路由：所有非 API 请求都返回 index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
