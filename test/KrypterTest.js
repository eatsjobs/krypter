/**
 * Created by pasquale on 30/10/15.
 */
describe('Krypter Test',function(){

	beforeEach(function(){
		krypter = new Krypter();
	});

	// tests start here
	it('window crypto should be defined',function(){
		expect(window.crypto).toBeDefined();
		expect(window.crypto.subtle).toBeDefined();
		expect(krypter).toBeDefined();
	});

	it('Generate Key Pairs', function(done){

		var savePrivate = function(pkey) {
			expect(pkey).toBeDefined();
			expect(pkey.alg).toBe("RS256");
			expect(pkey.key_ops[0]).toBe("sign");
			//it's the last operation so i call done here
			done();
		};

		var savePublic = function(pkey){
			expect(pkey).toBeDefined();
			expect(pkey.alg).toBe("RS256");
			expect(pkey.key_ops[0]).toBe("verify");
		};

		krypter.generateKeyPairs(savePublic, savePrivate);
	});

	it('Import private key in JWK and sign', function(done){
		krypter.generateKeyPairs(savePublic, savePrivate);

		var publicJWK;
		var savePublic = function(pkey){
			publicJWK = pkey
		};

		var privateJWK;
		var savePrivate = function(pkey) {
			console.log("private saved", pkey);
			privateJWK = pkey;
			console.log("Now sign Object");
			krypter.sign({chiave:"valore"}, pkey, 'RSA256', saveSignature);
		};

		var saveSignature = function(e){
			console.log(e, "Signature");
			expect(e).toBeDefined();
			done();
		};
	});

	it('Import public key in JWK and verify', function(done){

		var privateJWK;
		var savePrivate = function(pkey) {
			console.log("private saved", pkey, "now sign");
			privateJWK = pkey;
			krypter.sign({chiave:"valore"}, pkey, "RSA256", saveSignature);
		};

		var publicJWK;
		var savePublic = function(pkey){
			publicJWK = pkey
		};

		var saveSignature = function(e){
			expect(e).toBeDefined();
			krypter.verify({chiave:"valore"}, e, publicJWK, "RSA256");
			done();
		};

		krypter.generateKeyPairs(savePublic, savePrivate);
	});
});