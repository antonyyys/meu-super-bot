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

    // Lógica: Cobrar os frangos após 30 min
    if (text.includes('jogar') || text.includes('bora')) {
        if (timerJogar) clearTimeout(timerJogar);
        timerJogar = setTimeout(async () => {
            chat.sendMessage("E aí bando de frangos? Alguém chamou pra jogar e tá todo mundo calado? Vão amarelar mesmo? 🐔");
        }, 30 * 60 * 1000);
    }

    if (text.includes('@bot')) {
        chat.sendStateTyping();

        // Salvar meta de preço: "@bot meta RTX 3060 1500"
        if (text.includes('meta')) {
            const partes = text.split(' ');
            const preco = partes.pop();
            const item = partes.join(' ').replace('@bot meta', '').trim();
            metasPreco[item] = preco;
            return msg.reply(\Entendido \! Salvei a meta: quando eu achar \ por R$ \ pra você ou pro Renan, eu aviso!\);
        }

        const prompt = \Você é um membro zoeiro de um grupo gamer. O Renan é um dos membros. Trate todos como 'frangos'.
        REGRAS DE RESPOSTA:
        1. Se for Hardware, pesquise no Google Search e use o formato:
           AGORA VAI <CLASSIFICACAO>
           <IMAGEM_URL>
           **<NOME>**
           VALOR: R$ <VALOR>
           LINK: <LINK>
           NOTA: <0/10>
           CUPONS: <SE HOUVER>
           SITE: <NOME DO SITE> (Pesquise 3 de cada).
        2. Se for Jogo, use o formato:
           SEGUE OS JOGOS <CLASSIFICACAO>
           <IMAGEM_URL>
           **<NOME>** - <VALOR>
           PLATAFORMA: <PLATAFORMA>
           NOTA: <NOTA>
        3. Nunca indique jogos pornô.
        4. Comente notícias bombásticas como se fosse um participante do grupo.
        
        Pergunta de \: \\;

        try {
            const result = await model.generateContent(prompt);
            msg.reply(result.response.text());
        } catch (e) {
            msg.reply("Tô processando os dados aqui frango, tenta de novo!");
        }
    }
});

client.on('qr', qr => qrcode.generate(qr, {small: true}));
client.on('ready', () => console.log('BOT ONLINE NO KOYEB!'));
client.initialize();

const app = express();
app.get('/', (req, res) => res.send('Bot Ativo!'));
app.listen(8080);
