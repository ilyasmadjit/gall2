import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// ⚙️ Настройки — вставь свои данные
const TELEGRAM_BOT_TOKEN = "8228718888:AAFRG7s82mDXvMocI-dn-WBTtFX72DTbyO4";

// id чатов (замени!)
const CHATS = {
    "Шоссейная": "-1003254877531",
    "Краснококшайская": "-1003401940240",
    "Мередианная": "-1003306164529"
};

async function sendToTelegram(chatId, text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML"
    });
}

// 📩 Вебхук от Яндекс-приложения
app.post("/webhook", async (req, res) => {
    try {
        const data = req.body;

        // 🧩 Извлекаем поля лида
        const name = data.name || "Не указано";
        const phone = data.phone || "Не указано";
        const address = data.address || data.site || "Адрес не найден";

        // 🎯 Определяем чат
        let chatId = null;
        if (address.includes("Шоссей")) chatId = CHATS["Шоссейная"];
        else if (address.includes("Краснококш")) chatId = CHATS["Краснококшайская"];
        else if (address.includes("Мередиан")) chatId = CHATS["Мередианная"];

        if (!chatId) {
            console.log("Не удалось определить адрес:", address);
            return res.status(200).json({ status: "no_match" });
        }

        // 📨 Формируем сообщение
        const message = `
<b>Новый лид</b>
Имя: ${name}
Телефон: ${phone}
Адрес: ${address}
        `.trim();

        // 🔥 Отправка в Telegram
        await sendToTelegram(chatId, message);

        res.status(200).json({ status: "ok" });

    } catch (err) {
        console.error("Ошибка:", err);
        res.status(500).json({ error: "server_error" });
    }
});

app.get("/", (req, res) => {
    res.send("Webhook is running!");
});

// Render использует PORT из env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
