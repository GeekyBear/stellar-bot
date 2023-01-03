var express = require('express');
var app = express();
var cors = require('cors')
const fs = require('fs');
const fundAccount = require('./tools/autofundAccount');

// For parsing application/json
app.use(express.json());
app.use(cors())

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

app.get('/data', async function (req, res) {
    var json = await readFile("my.json"); // File reading
    var accounts = JSON.parse(json); // The data needs parsing before using it.
    res.json(accounts);
});

app.post('/fund', async function (req, res) {
    console.log('Hicieron POST a /fund. Aqui se ejecuta la funcion fundAccount');
    const { issuerAccount, token } = req.body;
    let response = issuerAccount !== '' ? await fundAccount(issuerAccount, token) : null;
    console.log('response', response)
    return response;
});

app.listen(3001, function () {
    console.log('Aplicación ejemplo, escuchando el puerto 3001!');
});
