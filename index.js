import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// берем токен из Render Environment
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// chat_id (лучше тоже в ENV, но можно пока прямо тут)
const CHATS = {
  "Шоссейная": process.env.CHAT_SHOSSEINAYA,
  "Краснококшайская": process.env.CHAT_KRASNOKOKSHAYSKAYA,
  "Мередианная": process.env.CHAT_MERIDIANNAYA
};

async function sendToTelegram(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await axios.post(url, { chat_id: chatId, text });
}

app.get("/", (req, res) => res.send("OK"));

app.post("/webhook", async (req, res) => {
  try {
    const data = req.body || {};

    // ВАЖНО: поправим под твой формат, но пока универсально
    const name = data.name || data.client_name || "Не указано";
    const phone = data.phone || data.client_phone || "Не указано";
    const address = data.address || data.branch || data.point || "Адрес не найден";

    let chatId = null;
    const a = String(address).toLowerCase();

    if (a.includes("шосс")) chatId = CHATS["Шоссейная"];
    else if (a.includes("краснококш")) chatId = CHATS["Краснококшайская"];
    else if (a.includes("меред") || a.includes("меридиан")) chatId = CHATS["Мередианная"];

    if (!chatId) {
      console.log("NO MATCH address:", address, "BODY:", data);
      return res.status(200).json({ status: "no_match" });
    }

    const msg =
      `Новый лид\n` +
      `Имя: ${name}\n` +
      `Телефон: ${phone}\n` +
      `Адрес: ${address}`;

    await sendToTelegram(chatId, msg);
    return res.status(200).json({ status: "ok" });

  } catch (e) {
    console.error("ERROR:", e?.response?.data || e.message);
    return res.status(500).json({ error: "server_error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
