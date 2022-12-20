const { Keypair } = require('stellar-sdk');
var StellarSdk = require('stellar-sdk');
require('dotenv').config()
const fs = require('fs')

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

// Get the pair from the source account with the secret stored in the .env file ;)
var pair = Keypair.fromSecret(process.env.SECRET_KEY)

async function fundAccount() {
    var json = await readFile("my.json"); // File reading
    var accounts = JSON.parse(json); // The data needs parsing before using it.

    // Use the "source" account to create a new account on the ledger.
    try {
        const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
        var parentAccount = await server.loadAccount(pair.publicKey()); // Make sure the parent account exists on ledger
        var childAccount = StellarSdk.Keypair.random(); // Generate a random account to create

        // Create a transacion object.
        var createAccountTx = new StellarSdk.TransactionBuilder(parentAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        });

        // Add the create account operation to the createAccountTx transaction.
        createAccountTx = await createAccountTx
            .addOperation(
                StellarSdk.Operation.createAccount({
                    destination: childAccount.publicKey(),
                    startingBalance: "5",
                }),
            )
            .setTimeout(180)
            .build();

        // Sign the transaction with the account that was created from friendbot.
        await createAccountTx.sign(pair);

        // Submit the transaction
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

        console.log('Transaction response: ', txResponse);
        console.log("Created the new account", childAccount.publicKey());

        // Store the secret of the newly created account in the accounts array
        accounts.push(childAccount.secret())

        // Function to stringify and store the accounts array into the "my.json" file.
        require('fs').writeFile(
            './my.json',
            JSON.stringify(accounts),
            function (err) {
                if (err) {
                    console.error('No se pudo guardar');
                }
            }
        );
    } catch (e) {
        console.error("ERROR!", e);
    }
}

function bot() {
    fundAccount()
}

bot();
