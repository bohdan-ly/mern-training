// console.log(arguments);
// console.log(require('module').wrapper);

// module.exports
const C = require('./mod1');
const calc1 = new C();
console.log(calc1.add(2, 3));

// exports
// const calc2 = require('./mod2');
const { multiply, add } = require('./mod2');

console.log(multiply(2, 3));

// caching

require('./mod3')();
require('./mod3')();
require('./mod3')();