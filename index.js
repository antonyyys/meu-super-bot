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
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
    }
});

let timerJogar = null;

client.on('message', async (msg) => {
    const text = msg.body.toLowerCase();
    const chat = await msg.getChat();
    const userContact = await msg.getContact();
    const userName = userContact.pushname || "Frango";

    if (text.includes('jogar') || text.includes('bora') || text.includes('vms')) {
        if (timerJogar) clearTimeout(timerJogar);
        timerJogar = setTimeout(async () => {
            chat.sendMessage("E aí bando de frangos? Alguém chamou pra jogar e tá todo mundo calado? Vão amarelar mesmo? 🐔");
        }, 30 * 60 * 1000);
    }

    if (text.includes('@bot')) {
        chat.sendStateTyping();
        const prompt = "Você é um membro ultra inteligente e zoeiro de um grupo de hardware. O Renan é um dos membros (não é o bot). Trate todos como 'frangos'. Se pedirem hardware ou jogos, pesquise no Google. Preze QUALIDADE acima de tudo. Se o preço for bom mas a marca for ruim, avise que é bomba. Pergunta: " + msg.body;
        const result = await model.generateContent(prompt);
        return msg.reply(result.response.text());
    }
});

client.on('qr', qr => qrcode.generate(qr, {small: true}));
client.on('ready', () => console.log('BOT ONLINE! CONECTA AÍ FRANGO!'));
client.initialize();

const app = express();
app.get('/', (req, res) => res.send('Bot Ativo!'));
app.listen(process.env.PORT || 3000);
