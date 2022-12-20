const { Keypair } = require('stellar-sdk');
var StellarSdk = require('stellar-sdk');
require('dotenv').config()

var pair = Keypair.fromSecret(process.env.SECRET_KEY)

async function fundAccount() {
    // After you've got your test lumens from friendbot, we can also use that account to create a new account on the ledger.
    try {
        const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
        var parentAccount = await server.loadAccount(pair.publicKey()); //make sure the parent account exists on ledger
        var childAccount = StellarSdk.Keypair.random(); //generate a random account to create
        //create a transacion object.
        var createAccountTx = new StellarSdk.TransactionBuilder(parentAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        });
        //add the create account operation to the createAccountTx transaction.
        createAccountTx = await createAccountTx
            .addOperation(
                StellarSdk.Operation.createAccount({
                    destination: childAccount.publicKey(),
                    startingBalance: "5",
                }),
            )
            .setTimeout(180)
            .build();
        //sign the transaction with the account that was created from friendbot.
        await createAccountTx.sign(pair);
        //submit the transaction
        let txResponse = await server
            .submitTransaction(createAccountTx)
            // some simple error handling
            .catch(function (error) {
                console.log("there was an error");
                console.log(error.response);
                console.log(error.status);
                console.log(error.extras);
                return error;
            });
        console.log(txResponse);
        console.log("Created the new account", childAccount.publicKey());
    } catch (e) {
        console.error("ERROR!", e);
    }
}

function bot() {
    fundAccount()
}

bot();