const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

// <-- Files -->

// const res = fs.readFileSync('./starter/txt/input.txt', 'utf-8');

// const textOut = `hello ${res}\nCreated at: ${Date.now()}`;
// fs.writeFileSync('./starter/txt/output.txt', textOut);

// console.log('File written!');

// Non-blocking async

// fs.readFile('./starter/txt/start.txt', 'utf-8', (err, data1) => {
//   fs.readFile(`./starter/txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     console.log(data2);
//     fs.readFile(`./starter/txt/append.txt`, 'utf-8', (err, data3) => {
//       console.log(data3);
//       fs.writeFile(
//         './starter/txt/final.txt',
//         `${data2}\n${data3}`,
//         'utf-8',
//         (err) => {
//             console.log('File written!');
//         }
//       );
//     });
//   });
// });

// console.log('Will read now');

// <-- SERVER -->

const mainPath = `${__dirname}`;

const tempOverview = fs.readFileSync(
  `${mainPath}/templates/template-overview.html`,
  'utf8'
);
const tempProduct = fs.readFileSync(
  `${mainPath}/templates/template-product.html`,
  'utf8'
);
const tempCard = fs.readFileSync(
  `${mainPath}/templates/template-card.html`,
  'utf8'
);

const devData = fs.readFileSync(`${mainPath}/dev-data/data.json`, 'utf8');
const parsedDevData = JSON.parse(devData);

const slugs = parsedDevData.map((el) =>
  slugify(el.productName, { lower: true })
);

const server = http.createServer((req, res) => {
  try {
    const { query, pathname } = url.parse(req.url, true);

    switch (pathname) {
      case '/':
      case '/overview':
        res.writeHead(200, {
          'Content-Type': 'text/html',
        });

        const cards = parsedDevData
          .map((card, idx) =>
            replaceTemplate(tempCard, { ...card, id: slugs[idx] })
          )
          ?.join('\n');

        const overview = replaceTemplate(tempOverview, {
          PRODUCT_CARDS: cards,
        });

        res.end(overview);
        break;

      case '/api':
        res.writeHead(200, {
          'Content-Type': 'application/json',
        });
        res.end(devData);
        break;

      case '/product':
        const cardId = query.id;

        res.writeHead(200, {
          'Content-Type': 'text/html',
        });

        const cardData = parsedDevData.find(
          (el) => slugify(el.productName, { lower: true }) === cardId
        );

        const card = replaceTemplate(tempProduct, cardData);

        res.end(card);
        break;

      default:
        res.writeHead(404, {
          'Content-Type': 'text/html',
          'my-custom-header': 'hello-world',
        });
        res.end('<h1>Page not found!</h1>');
        break;
    }
  } catch (err) {
    console.error(err);
    res.end('Something unusually happens');
  }
});

server.listen(8000, '127.0.0.1', () =>
  console.log('Listening to requests on port 8000')
);
