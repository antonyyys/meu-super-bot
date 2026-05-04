const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

const GEMINI_KEY = "AIzaSyBH9NBatCGkhsynu1lsdANo7A2XbfA-oLE"; 
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", 
    tools: [{ googleSearch: {} }] 
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

let metasPreco = {}; 
let timerJogar = null;

client.on('message', async (msg) => {
    const text = msg.body.toLowerCase();
    const chat = await msg.getChat();
    const userContact = await msg.getContact();
    const userName = userContact.pushname || "Frango";

    // 1. Cobrador de Frangos (30 min de silêncio)
    if (text.includes('jogar') || text.includes('bora') || text.includes('vms')) {
        if (timerJogar) clearTimeout(timerJogar);
        timerJogar = setTimeout(async () => {
            chat.sendMessage("E aí bando de frangos? Alguém chamou pra jogar e tá todo mundo calado? Vão amarelar mesmo? 🐔");
        }, 30 * 60 * 1000);
    }

    // 2. Comandos Interativos @bot
    if (text.includes('@bot')) {
        chat.sendStateTyping();

        // Meta de Preço: "@bot meta rtx 3060 1500"
        if (text.includes('meta')) {
            const partes = text.split(' ');
            const preco = partes.pop();
            const item = partes.join(' ').replace('@bot meta', '').trim();
            metasPreco[item] = preco;
            return msg.reply(\Salve \! Guardei. Quando eu achar \ por R$ \ (nada de bomba), eu aviso o Renan e o grupo!\);
        }

        const prompt = \Você é um assistente zoeiro e inteligente. O Renan é um membro do grupo. Trate todos como 'frangos'.
        REGRAS: 
        - Hardware: Pesquise no Google Search. Se for lixo, avise. Use o formato:
          AGORA VAI <CLASSIFICACAO>
          <URL_DA_IMAGEM>
          **<NOME>**
          VALOR: R$ <VALOR>
          LINK: <LINK>
          NOTA: <0/10>
          SITE: <SITE>
        - Jogos: Formato:
          SEGUE OS JOGOS <CLASSIFICACAO>
          <URL_DA_IMAGEM>
          **<NOME>** - <VALOR>
          PLATAFORMA: <PLATAFORMA>
          NOTA: <NOTA>
        - Saudação: "SALVE FRANGOSSS OLHA O JOGOS DE HOJE!"
        - Jamais indique conteúdo pornô.
        Pergunta do \: \\;

        try {
            const result = await model.generateContent(prompt);
            msg.reply(result.response.text());
        } catch (e) {
            msg.reply("Deu gargalo aqui frango, tenta de novo!");
        }
    }
});

client.on('qr', qr => qrcode.generate(qr, {small: true}));
client.on('ready', () => console.log('BOT ONLINE NO HUGGING FACE!'));
client.initialize();

const app = express();
app.get('/', (req, res) => res.send('Bot Vivo!'));
app.listen(7860, '0.0.0.0');
