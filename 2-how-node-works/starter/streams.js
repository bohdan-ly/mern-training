const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
  // Solution 1
  //   fs.readFile('test-file.txt', 'utf8', (err, data) => {
  //     if (err) console.error(err);
  //     res.end(data);
  //   });
  // Solution 2: Streams
  //   const readable = fs.createReadStream('test-file.txt');
  //   readable.on('error', (err) => {
  //     console.error(err);
  //     res.statusCode = 500;
  //     res.end('File not found');
  //   });
  //   readable.on('data', (chunk) => res.write(chunk));
  //   readable.on('end', () => res.end());
  // Solution 3

  const readable = fs.createReadStream('test-file.txt');
  readable.pipe(res);

  // readableSource.pipe(writableDest);
});

server.listen(8000, '127.0.0.1', (req, res) =>
  console.log('Waiting for request...')
);
