const http = require('http');
const fs = require('fs');
const fastXmlParser = require('fast-xml-parser');

function XMLParser(xmlString) {
  const options = {
    attributeNamePrefix: '@',
    ignoreAttributes: false,
    format: true,
  };

  return fastXmlParser.parse(xmlString, options);
}

function XMLBuilder(data) {
  const builderOptions = {
    attributeNamePrefix: '@',
    format: true,
  };

  const xmlBuilder = new fastXmlParser.j2xParser(builderOptions);
  return xmlBuilder.parse(data);
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const xmlData = fs.readFileSync('data.xml', 'utf8');
    const parsedData = XMLParser(xmlData);

    if (parsedData && parsedData.indicators && parsedData.indicators.banksincexp) {
      const banksincexpData = parsedData.indicators.banksincexp;

      const filteredData = banksincexpData.filter((item) => {
        return item.txt === 'Доходи, усього' || item.txt === 'Витрати, усього';
      });

      const xmlResponse = {
        data: {
          indicators: filteredData.map(item => ({
            txt: item.txt,
            value: item.value
          }))
        }
      };

      const xmlString = XMLBuilder(xmlResponse);

      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(xmlString);
    } else {
      res.statusCode = 500;
      res.end('Invalid XML Data');
    }
  } else {
    res.statusCode = 400;
    res.end('Bad Request');
  }
});

server.listen(8000, () => {
  console.log('Сервер запущено');
});
