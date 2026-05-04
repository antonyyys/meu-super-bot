const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

const GEMINI_KEY = "SUA_NOVA_KEY_AQUI"; 
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    tools: [{ googleSearch: {} }] 
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

// Lógica de Monitoramento (Cobra o pessoal depois de 30 min)
let timerJogar = null;

client.on('message', async (msg) => {
    const text = msg.body.toLowerCase();

    // Lógica Interativa: Alguém chamou para jogar
    if (text.includes('jogar') || text.includes('bora') || text.includes('vms')) {
        if (timerJogar) clearTimeout(timerJogar);
        timerJogar = setTimeout(async () => {
            const chat = await msg.getChat();
            chat.sendMessage("E aí bando de frangos? Alguém chamou pra jogar e tá todo mundo calado? Vão amarelar mesmo? 🐔");
        }, 30 * 60 * 1000); // 30 minutos
    }

    // Resposta ao @BOT ou Notícias Automáticas
    if (text.includes('@bot')) {
        const chat = await msg.getChat();
        chat.sendStateTyping();
        const prompt = "Você é um membro zoeiro de um grupo de hardware e games. Responda como um participante normal, use gírias gamer, mas seja muito inteligente. Se perguntarem de hardware ou jogos, pesquise na internet e dê infos reais. Pergunta: " + msg.body;
        
        const result = await model.generateContent(prompt);
        msg.reply(result.response.text());
    }
});

client.on('qr', qr => qrcode.generate(qr, {small: true}));
client.on('ready', () => console.log('Bot Elite Online!'));
client.initialize();

const app = express();
app.listen(process.env.PORT || 3000);
