# Service to Service authentication using AWS Cognito

## Create a Cognito User Pool
```shell
aws cognito-idp create-user-pool --pool-name test-servertoserver-userpool
```
Retrieve the `id` from the response. Looks like this: `"Id": "eu-west-1_XXXX"`

## Listing Cognito User Pools if needed

```shell
aws cognito-idp list-user-pools --max-results 5
```
Response:
```json
{
    "CreationDate": 1555416572.157,
    "LastModifiedDate": 1555416572.157,
    "LambdaConfig": {},
    "Id": "eu-west-1_XXXX",
    "Name": "test-servertoserver-userpool"
}
```

## Tagging Cognito User Pool
```shell
aws cognito-idp tag-resource \
    --resource-arn arn:aws:cognito-idp:eu-west-1:XXXXXXXX:userpool/eu-west-1_XXXXX \
    --tags env=dev,service=auth,product=service-to-service-auth
```

## Create a Resource Server
We will only create getter transactions for this example. You can add multiple scopes if required by just appending it at the end of the following command.
```shell
aws cognito-idp create-resource-server --name transactions --identifier transactions --user-pool-id eu-west-1_XXXX --scopes ScopeName=get,ScopeDescription=get_tx
```

## Create a Client App
Create Client app that is only allowed to use the get transactions
```shell
aws cognito-idp create-user-pool-client --user-pool-id eu-west-1_XXXX --allowed-o-auth-flows client_credentials --client-name test-servertoserver --generate-secret --allowed-o-auth-scopes transactions/get --allowed-o-auth-flows-user-pool-client
```

## Add a Domain
Domain is global and therefore cannot be something completelly random.
```shell
aws cognito-idp create-user-pool-domain  --domain test-servertoserver-dm --user-pool-id eu-west-1_XXXX
```
Associated URL based on domain: 
https://test-servertoserver-dm.auth.eu-west-1.amazoncognito.com/oauth2/token

## Get an Access Token
Using openssl and replacing x with ClientId and y with ClientSecret one can retrive tha base64 encoding of our id to generate the access token
```shell
# Use -A to remove line breaks
echo -n 'x:y' | openssl base64 -A
```

```shell
curl -X POST \
  https://test-servertoserver-dm.auth.eu-west-1.amazoncognito.com/oauth2/token \
  -H 'authorization: Basic XXXXXXXXXXXXXXXXXXXXXXXXXX' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&scope=transactions%2Fget'
```
Response
```json
{
    "access_token": "XXXXXXXXXXXXXXXXXXX",
    "expires_in": 3600,
    "token_type": "Bearer"
}
```


## Validate the Access Token
This section would need familiarity with JWT, JWK, and a bit of encryption standards.

To peek in the access token, you may paste it in jtw.io

The following url contains the jwks: 
https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_XXXX/.well-known/jwks.json

Example from jwk website:
```json
{
    "keys": [{
        "alg": "RS256",
        "e": "AQAB",
        "kid": "XXXXXXXXXXX=",
        "kty": "RSA",
        "n": "XXXXXXXXXX",
        "use": "sig"
    }, {
        "alg": "RS256",
        "e": "AQAB",
        "kid": "XXXXXXXXXXX=",
        "kty": "RSA",
        "n": "XXXXXXXXXX",
        "use": "sig"
    }]
}
 ```

 ### Validating using Node.js
 ```js
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

 ```
 