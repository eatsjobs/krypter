/**
 * Created by pasquale on 30/10/15.
 */
var Krypter = require("../src/Krypter");
describe('Krypter Test',function(){

	beforeEach(function(){

	});

	// tests start here
	it('Krypter should be defined',function(){
		expect(Krypter).toBeDefined();
	});

	it('Key Pairs should be generated correctly', function(done){

        Krypter.generateKeyPairs()
				.then(function(keys){
                    // keys[1] public
                    // keys[0] private
                    expect(keys.public.key_ops[0]).toEqual("verify");
                    expect(keys.private.key_ops[0]).toEqual("sign");
                    done();
                });

	});

	it('Import private key in JWK format and sign', function(done){

		Krypter.generateKeyPairs().then(function(keys){
            return Krypter.sign("text", keys.private, "RSA256");
        }).then(function(_signature){
            var isBase64 = new RegExp(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/).test(_signature);
            expect(isBase64).toBe(true);
            done();
        });
	});

	it('Import public key in JWK and verify', function(done){

        var theCommonMessage = "The Message";

        Krypter.generateKeyPairs().then(function(keys){
            return Promise.all([Krypter.sign(theCommonMessage, keys.private, "RSA256"), keys.public]);

        }).then(function(_signatureAndPublicKey){
            var signature = _signatureAndPublicKey[0];
            var publicKey = _signatureAndPublicKey[1];

            return Krypter.verify(theCommonMessage, signature, publicKey, "RSA256");

        }).then(function(verified){
            expect(verified).toBe(true);
            done();
        });
	});
});