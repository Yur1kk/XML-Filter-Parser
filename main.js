const http = require('http');
const fs = require('fs');
const fastXmlParser = require('fast-xml-parser');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Читаємо дані з файлу data.xml
    const xmlData = fs.readFileSync('data.xml', 'utf8');
    const options = {
      ignoreAttributes: false, // Розглядає атрибути як елементи
    };

    // Аналізуємо XML-дані
    const parsedData = fastXmlParser.parse(xmlData, options);
    
    // Фільтруємо дані, обираючи лише обрані категорії
    const filteredData = parsedData.indicators.banksincexp.filter((item) => {
      return item.txt === 'Доходи, усього' || item.txt === 'Витрати, усього';
    });

    // Створюємо початок XML-відповіді з обгорненим <data> елементом
    let xmlResponse = '<?xml version="1.0" encoding="UTF-8"?>\n<data>';

    // Оброблюємо кожен обраний елемент та створюємо відповідну структуру XML в середині <data>
    for (const item of filteredData) {
      xmlResponse += '\n  <indicators>';
      xmlResponse += `\n    <txt>${item.txt}</txt>`;
      xmlResponse += `\n    <value>${item.value}</value>`;
      xmlResponse += '\n  </indicators>';
    }

    // Завершуємо XML-структуру, включаючи закриваючий </data> елемент
    xmlResponse += '\n</data>';

    // Відправляємо XML-відповідь зі статусом 200 (OK)
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(xmlResponse);
  } else {
    res.statusCode = 400;
    res.end('Bad Request');
  }
});

// Запускаємо сервер на порті 8000
server.listen(8000, () => {
  console.log('Сервер запущено');
});
