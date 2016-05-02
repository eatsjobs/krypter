# Krypter.js
A minimal basic class for HTML5 Web Cryptography API

- Sign and verify a text or an Object in RSA algorithm
- JWK key standard support

For browser support see http://caniuse.com/#feat=cryptography


### Initialize and generate the key pairs
```javascript
var publicJWK, //distribute this 
    privateJWK, //sign with this


Krypter.generateKeyPairs().then(function(keys){
    // keys.public public
    // keys.private private
})

```
 
### Sign an object or a string

```javascript

var keysPromise = Krypter.generateKeyPairs();

keysPromise.then(function(keys){
    return Krypter.sign({aa:"bb"}, keys.private, "RSA256");
}).then(function(signature){
    // do somenthing with signature here
    // send({aa:"bb"}, signature, keys.public)
});

```

### Verify an object or a string

```javascript
Krypter.verify({aa:"bb"}, signature, publicJWK, 'RSA256')
    .then(function(isVerified){
    //isVerified is a boolean
});

```

### Build up

```javascript
npm run build // generate normal, min version and docs
npm run docs // generate only documentation
npm run test:develop // run test in develop env
npm run test // run test in single run in Chrome and Firefox
```