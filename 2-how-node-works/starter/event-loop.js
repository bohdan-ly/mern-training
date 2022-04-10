const fs = require('fs');
const crypto = require('crypto');
const myEmitter = require('./events');

myEmitter.on('newSale', () => {
  console.log('New sale! 2');
});

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 4;

setTimeout(() => console.log('Timer 1 finish'), 0);
setImmediate(() => console.log('Immediate 1 finish\n-------------\n'), 0);

fs.readFile('./test-file.txt', () => {
  console.log('IO finished');
  console.log('------------------');
  setTimeout(() => console.log('Timer 2 finish'), 0);
  setTimeout(() => console.log('Timer 3 finish'), 3000);
  setImmediate(() => console.log('Immediate 2 finish'), 0);
  process.nextTick(() => console.log('Next tick'));
  const res = crypto.pbkdf2Sync('password', 'salt', 100000, 1024, 'sha512');
  console.log(Date.now() - start, 'Password encrypted', res);

  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () =>
    console.log(Date.now() - start, 'Password encrypted')
  );
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () =>
    console.log(Date.now() - start, 'Password encrypted')
  );
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () =>
    console.log(Date.now() - start, 'Password encrypted')
  );
});

console.log('Hello from top level-code');
