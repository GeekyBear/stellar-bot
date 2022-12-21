var StellarSdk = require("stellar-sdk");
require('dotenv').config()

function issueAssets(issuer, receiver) {
    var server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

    // Keys for accounts to issue and receive the new asset
    var issuingKeys = StellarSdk.Keypair.fromSecret(issuer);

    var receivingKeys = StellarSdk.Keypair.fromSecret(receiver);

    // Create an object to represent the new asset
    var ARSX = new StellarSdk.Asset("ARSX", issuingKeys.publicKey());

    // First, the receiving account must trust the asset
    server
        .loadAccount(receivingKeys.publicKey())
        .then(function (receiver) {
            var transaction = new StellarSdk.TransactionBuilder(receiver, {
                fee: 100,
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                // The `changeTrust` operation creates (or alters) a trustline
                // The `limit` parameter below is optional
                .addOperation(
                    StellarSdk.Operation.changeTrust({
                        asset: ARSX,
                        //limit: "1000",
                    }),
                )
                // setTimeout is required for a transaction
                .setTimeout(100)
                .build();
            transaction.sign(receivingKeys);
            return server.submitTransaction(transaction);
        })
        .then(console.log)

        // Second, the issuing account actually sends a payment using the asset
        .then(function () {
            return server.loadAccount(issuingKeys.publicKey());
        })
        .then(function (issuer) {
            var transaction = new StellarSdk.TransactionBuilder(issuer, {
                fee: 100,
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: receivingKeys.publicKey(),
                        asset: ARSX,
                        amount: "10",
                    }),
                )
                // setTimeout is required for a transaction
                .setTimeout(100)
                .build();
            transaction.sign(issuingKeys);
            return server.submitTransaction(transaction);
        })
        .then(console.log)
        .catch(function (error) {
            console.error("Error!", error);
        });
}
module.exports = { issueAssets }