var jwkToPem = require('jwk-to-pem');
var jwt = require('jsonwebtoken');

var jwk = {
	"alg": "RS256",
	"e": "AQAB",
	"kid": "XXXXXXXXXXX=",
	"kty": "RSA",
	"n": "XXXXXXXXXXX",
	"use": "sig"
};

const token = "XXXXXXXX"
var pem = jwkToPem(jwk);

jwt.verify(token, pem, { algorithms: ['RS256'] }, function(err, decodedToken) {
	console.log(decodedToken);
});

console.log(pem)