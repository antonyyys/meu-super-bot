const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

const GEMINI_KEY = "AIzaSyBH9NBatCGkhsynu1lsdANo7A2XbfA-oLE"; 
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", tools: [{ googleSearch: {} }] });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        executablePath: '/usr/bin/google-chrome',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage', 
            '--single-process', 
            '--no-zygote'
        ] 
    }
});

client.on('message', async (msg) => {
    const text = msg.body.toLowerCase();
    if (text.includes('@bot')) {
        const chat = await msg.getChat();
        chat.sendStateTyping();
        const prompt = "Você é um membro zoeiro de um grupo gamer. O Renan é um membro do grupo. Trate todos como 'frangos'. Pesquise no Google Search se pedirem algo de hardware. Pergunta: " + msg.body;
        try {
            const result = await model.generateContent(prompt);
            msg.reply(result.response.text());
        } catch (e) {
            msg.reply("Tô ocupado aqui frango, tenta de novo!");
        }
    }
});

client.on('qr', qr => qrcode.generate(qr, {small: true}));
client.on('ready', () => console.log('BOT ONLINE! CONECTA LOGO!'));
client.initialize();

const app = express();
app.get('/', (req, res) => res.send('Bot Ativo!'));
app.listen(process.env.PORT || 3000);
