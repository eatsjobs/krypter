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
    // keys[1] public
    // keys[0] private
}).then(youCanChainHere)

```
 
### Sign an object or a string

```javascript

Krypter.sign("textOrObject", keys[0], "RSA256").then(function(signature){
    //do somenthing with signature here
})

```

### Verify an object or a string

```javascript
Krypter.verify(toverify, signature, publicJWK, 'RSA256')
    .then(function(isVerified){
    //isVerified is a boolean
});

```
