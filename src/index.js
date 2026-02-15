import express from "express";
import dotenv from "dotenv";
import { getGroqResponse } from "./groqClient.js";
import path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Статические файлы
app.use(express.static("public"));
app.use(express.json());

// Точка API для общения с ботом
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await getGroqResponse(message);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
