const fs = require('fs');
var StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Async function to read the "accounts" from my.json
async function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomBetweenInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

async function autoPayment() {
    var json = await readFile("my.json"); // File reading
    var accounts = JSON.parse(json); // The data needs parsing before using it.

    var funds = 0;
    var senderAccount;
    var sourceKeypair;
    var sourcePublicKey;

    while (funds < 2000) {
        senderAccount = accounts[getRandomInt(accounts.length - 1)];

        sourceKeypair = StellarSdk.Keypair.fromSecret(senderAccount);
        sourcePublicKey = sourceKeypair.publicKey();

        const account = await server.loadAccount(sourcePublicKey);

        // console.log('senderAccount', senderAccount);
        // console.log('sourceKeypair', sourceKeypair);
        // console.log('sourcePublicKey', sourcePublicKey);
        // console.log('account', account.balances.find(asset => asset = 'ARSX'));
        funds = account.balances.find(asset => asset = 'ARSX').balance;
    }

    console.log('The senderAccount has enough funds in ARSX: ', funds)

    // Select an account that is going to receive the payment
    const receiverAccount = accounts[getRandomInt(accounts.length - 1)];
    // Obtain the KEYPAIR of the receiver 
    const receiverKeypair = StellarSdk.Keypair.fromSecret(receiverAccount);
    // Obtain the Public Key of the receiver 
    const receiverPublicKey = receiverKeypair.publicKey();

    console.log('receiverPublicKey', receiverPublicKey);
    var transaction;
    console.log('getRandomBetweenInt', getRandomBetweenInt(100, 1000));
    // First, check to make sure that the destination account exists.
    // You could skip this, but if the account does not exist, you will be charged
    // the transaction fee when the transaction fails.
    server
        .loadAccount(receiverPublicKey)
        // If the account is not found, surface a nicer error message for logging.
        .then(function (receiver) {
            var transaction = new StellarSdk.TransactionBuilder(receiver, {
                fee: 100,
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                // The `changeTrust` operation creates (or alters) a trustline
                // The `limit` parameter below is optional
                .addOperation(
                    StellarSdk.Operation.changeTrust({
                        asset: new StellarSdk.Asset('ARSX', sourcePublicKey),
                        //limit: "1000",
                    }),
                )
                // setTimeout is required for a transaction
                .setTimeout(100)
                .build();
            transaction.sign(receiverKeypair);
            return server.submitTransaction(transaction);
        })
        .catch(function (error) {
            if (error instanceof StellarSdk.NotFoundError) {
                throw new Error("The destination account does not exist!");
            } else return error;
        })
        // If there was no error, load up-to-date information on your account.
        .then(function () {
            return server.loadAccount(sourceKeypair.publicKey());
        })
        .then(function (sourceAccount) {
            // Start building the transaction.
            transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: receiverPublicKey,
                        // Because Stellar allows transaction in many currencies, you must
                        // specify the asset type. The special "native" asset represents Lumens.
                        //asset: 'ARSX',
                        asset: new StellarSdk.Asset('ARSX', sourcePublicKey),
                        amount: getRandomBetweenInt(100, 1000).toString(),
                    }),
                )
                // A memo allows you to add your own metadata to a transaction. It's
                // optional and does not affect how Stellar treats the transaction.
                .addMemo(StellarSdk.Memo.text("Test Transaction"))
                // Wait a maximum of three minutes for the transaction
                .setTimeout(180)
                .build();
            // Sign the transaction to prove you are actually the person sending it.
            transaction.sign(sourceKeypair);
            // And finally, send it off to Stellar!
            return server.submitTransaction(transaction);
        })
        .then(function (result) {
            console.log("Success! Results:", result);
        })
        .catch(function (error) {
            console.error("Something went wrong!", error);
            // If the result is unknown (no response body, timeout etc.) we simply resubmit
            // already built transaction:
            // server.submitTransaction(transaction);
        });
}

//autoPayment();
setInterval(autoPayment, 60000);