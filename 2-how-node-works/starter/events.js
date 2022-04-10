const EventEmitter = require('events');
const http = require('http');

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new Sales();

myEmitter.on('newSale', () => {
  console.log('New sale!');
});

myEmitter.on('newSale', (num) => {
  console.log('New sale!', num);
});

myEmitter.emit('newSale', 9);

module.exports = myEmitter;

////////////////////////////////////////////////////////////////

const server = http.createServer();

server.on('request', (req, res) => {
  res.end('Request received');
});

server.on('request', (req, res) => {
  console.log('Another received!');
});

server.on('close', (req, res) => {
  res.end('Server closed');
});

server.listen(8000, '127.0.0.1', (req, res) =>
  console.log('Waiting for request...')
);
