const axios = require('axios');
exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') { return { statusCode: 405, body: 'Method Not Allowed' }; }
    const { items, cep_destino } = JSON.parse(event.body);
    const SUPERFRETE_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTM3OTg5MjgsInN1YiI6IkVKNmtqa1BOa2lmbEUyODJkc3ZocVplRVNXaDIifQ.giq54IjTmZgCDUJ-QW6c0kkOP4Q4-nvzjTxWAFaUROA';
    const MEU_CEP_DE_ORIGEM = '44052009';
    let pesoTotal = 0, somaAltura = 0, maiorLargura = 0, maiorComprimento = 0;
    items.forEach(item => {
        pesoTotal += item.peso;
        somaAltura += item.altura;
        if (item.largura > maiorLargura) maiorLargura = item.largura;
        if (item.comprimento > maiorComprimento) maiorComprimento = item.comprimento;
    });
    const alturaFinal = Math.max(somaAltura, 1);
    const larguraFinal = Math.max(maiorLargura, 11);
    const comprimentoFinal = Math.max(maiorComprimento, 16);
    const data = {
        from: { postal_code: MEU_CEP_DE_ORIGEM },
        to: { postal_code: cep_destino },
        services: "1,2",
        package: { weight: parseFloat(pesoTotal.toFixed(2)), width: larguraFinal, height: alturaFinal, length: comprimentoFinal },
    };
    try {
        const response = await axios.post('https://api.superfrete.com/v1/shipping/calculate', data, {
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'MinhaLojaSempreBella/1.0', 'Authorization': `Bearer ${SUPERFRETE_API_TOKEN}` }
        });
        return { statusCode: 200, body: JSON.stringify(response.data) };
    } catch (error) {
        const errorMsg = error.response ? error.response.data : { error: "Erro ao calcular o frete." };
        return { statusCode: error.response ? error.response.status : 500, body: JSON.stringify(errorMsg) };
    }
};
