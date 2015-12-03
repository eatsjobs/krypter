/**
 * Created by pasquale on 30/10/15.
 */
describe('Krypter Test',function(){

	beforeEach(function(){

	});

	// tests start here
	it('window crypto should be defined',function(){
		expect(window.crypto).toBeDefined();
		expect(window.crypto.subtle).toBeDefined();
		expect(Krypter).toBeDefined();
	});

	it('Generate Key Pairs', function(done){

        Krypter.generateKeyPairs()
				.then(function(keys){
                    // keys[1] public
                    // keys[0] private
                    expect(keys[1].key_ops[0]).toEqual("verify");
                    expect(keys[0].key_ops[0]).toEqual("sign");
                    done();
                });

	});

	it('Import private key in JWK and sign', function(done){

		Krypter.generateKeyPairs().then(function(keys){
            return Krypter.sign("text", keys[0], "RSA256");
        }).then(function(_signature){
            var isBase64 = new RegExp(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/).test(_signature);
            expect(isBase64).toBe(true);
            done();
        });
	});

	it('Import public key in JWK and verify', function(done){

        var theCommonMessage = "The Message";

        Krypter.generateKeyPairs().then(function(keys){
            return Promise.all([Krypter.sign(theCommonMessage, keys[0], "RSA256"), keys[1]]);

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