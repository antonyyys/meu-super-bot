const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("SUA_NOVA_KEY_AQUI");
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    tools: [{ googleSearch: {} }] 
});

async function gerarRelatorio() {
    const prompt = \
    Pesquise na internet (Mercado Livre e Steam) e gere um relatório gamer.
    
    REGRAS DE HARDWARE:
    - Categorias: RAMs, GPUs, CPUs, Fontes, Gabinetes.
    - 3 itens de cada com melhor CUSTO-BENEFÍCIO (Preço vs Qualidade).
    - Formato obrigatório por item:
      AGORA VAI <CLASSIFICACAO>
      <IMAGEM_URL>
      <NOME>
      VALOR: <VALOR>
      LINK: <LINK>
      NOTA: <NOTA 0/10>
      CUPONS: <CUPONS OU NADA>
      SITE: <NOME DO SITE>

    REGRAS DE JOGOS:
    - Categorias: Grátis, Promoções >50%, Para Jogar com Amigos.
    - PROIBIDO JOGOS PORNOGRÁFICOS.
    - Comece com: "SALVE FRANGOSSS OLHA O JOGOS DE HOJE!"
    - Formato por jogo:
      SEGUE OS JOGOS <CLASSIFICACAO>
      <IMAGEM_URL>
      **<NOME>** - <VALOR>
      PLATAFORMA: <PLATAFORMA>
      TEMPO: <TEMPO RESTANTE SE HOUVER>
      NOTA: <NOTA>

    Seja zoeiro e provoque os participantes!\;

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
}

gerarRelatorio();
