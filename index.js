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
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
    }
});

let metasPreco = {}; 
let timerJogar = null;

client.on('message', async (msg) => {
    const text = msg.body.toLowerCase();
    const chat = await msg.getChat();
    const userContact = await msg.getContact();
    const userName = userContact.pushname || "Frango";

    // Lógica de cobrança (30 min de silêncio após chamar pra jogar)
    if (text.includes('jogar') || text.includes('bora') || text.includes('vms')) {
        if (timerJogar) clearTimeout(timerJogar);
        timerJogar = setTimeout(async () => {
            chat.sendMessage("E aí bando de frangos? Alguém chamou pra jogar e tá todo mundo calado? Vão amarelar mesmo? 🐔");
        }, 30 * 60 * 1000);
    }

    // Comando de Meta de Preço
    if (text.includes('@bot meta')) {
        const partes = text.split(' ');
        const preco = partes.pop();
        const item = partes.join(' ').replace('@bot meta', '').trim();
        metasPreco[item] = { preco: preco, user: userName };
        return msg.reply(\Salve \! Guardei aqui: quando eu achar \ por R$ \ (com qualidade de verdade), eu te aviso no grupo!\);
    }

    // Interação com o @BOT (IA Inteligente e Zoeira)
    if (text.includes('@bot')) {
        chat.sendStateTyping();
        const prompt = \Você é um membro ultra inteligente e zoeiro de um grupo de hardware. 
        O Renan é um dos membros (não é o bot). Trate todos como 'frangos'.
        Se pedirem hardware ou jogos, pesquise no Google Search.
        REGRAS: 
        1. Preze QUALIDADE (não indique bomba).
        2. Formato Hardware: 
           AGORA VAI <CLASSIFICACAO>
           <URL_DA_IMAGEM>
           **<NOME>**
           VALOR: R$ <VALOR>
           LINK: <LINK>
           NOTA: <0/10>
           CUPONS: <CUPONS>
           SITE: <SITE>
        3. Formato Jogos:
           SEGUE OS JOGOS <CLASSIFICACAO>
           <URL_DA_IMAGEM>
           **<NOME>** - <VALOR>
           PLATAFORMA: <PLATAFORMA>
           NOTA: <NOTA>
        
        Pergunta do \: \\;

        const result = await model.generateContent(prompt);
        return msg.reply(result.response.text());
    }
});

// Ciclo de Notícias e Enquetes (A cada 5 horas)
setInterval(async () => {
    // Aqui o bot pode enviar notícias ou enquetes automaticamente se tiver o ID do grupo
}, 5 * 60 * 60 * 1000);

client.on('qr', qr => qrcode.generate(qr, {small: true}));
client.on('ready', () => console.log('BOT ONLINE! ESCANEIE O QR CODE NOS LOGS DO RENDER!'));
client.initialize();

const app = express();
app.get('/', (req, res) => res.send('Bot Vivo!'));
app.listen(process.env.PORT || 3000);
