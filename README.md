
### Initialize and generate the key pairs
```javascript
var publicJWK, //distribute this 
    privateJWK, //sign with this
    krypter = new Krypter();

krypter.generateKeyPairs(function(daKey){publicJWK = daKey;}, function(daKey){privateJWK = daKey;}, function(){console.log(arguments);});

```
 
### Sign an object or a string

```javascript
var signature;
krypter.sign(tosign, privateJWK, 'RSA256', function(s){
            signature = s;
});

```

### Verify an object or a string

```javascript
var signature;
krypter.verify(toverify, signature, publicJWK, 'RSA256')
    .then(function(isVerified){
    //isVerified is a boolean
});

```
