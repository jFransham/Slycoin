'use strict';

const isReal = false;

const express = require('express');
const hbs =     require('express-handlebars');
const stripe =  require('stripe')(
	isReal ?
		'sk_live_DWFxOgCGi6MPNxnptLe4on7R' :
		'sk_test_XBHL4SYaHG2FPMiXzDYqIWqQ'
);

var app =
	module.exports =
	express();

app.use(express.static('static'));
app.engine('.hbs', hbs({extname: '.hbs'}));
app.set('view engine', 'handlebars');

function dp(n, str) {
	const spl =    str.toString().split('.');
	const output = spl[0] + '.' + spl[1].substring(0,2);
	return output;
}

function seed() {
	const params = {
		jsonrpc: '2.0',
		method: 'generateUUIDs',
		params: {
			apiKey: '00000000-0000-0000-0000-000000000000',
			n: 1,
		},
		id: Date.now.toString(),
	};

	const client = require('json-client')('https://api.random.org/json-rpc/1/invoke');
	client('get', '/', null, params).then(function (out) {

		});
}

app.get('/:amount',
	function (req, res) {
		const seed = new Buffer(Date.now().toString() + 'BTC' + Date.now().toString() + 'BTC');
		const bitcoin = require('bitcoinjs-lib');
		const wallet = bitcoin.ECPair.makeRandom({ rng: function() { return seed; } });
		const address = address.getAddress();
		const recv = buildReceiver(req.params.amount, address);
		const btcRatio = 1000000;
		const btc = (recv.bitcoin_amount / btcRatio);
		const to = "Big Stu's Beer and Truck Emporium";
		const gbp = dp(2, btc / 0.0063);

		res.render('index.html.hbs', {
			description: recv.description,
			address: recv.address,
			satoshi: recv.bitcoin_amount,
			amount: btc,
			gbp: gbp,
			friendly: encodeURIComponent(to),
			message: encodeURIComponent('£' + gbp + '\n' + recv.description),
		});

		const transactionBuilder = new bitcoin.TransactionBuilder();
	});

function getTransactions(address) {
	const client = require('json-client')('https://blockchain.info/);
	const addressInfo = client('get', 'address/' + address + '?format=json');

	const transactions = addressInfo.txs;

	return transactions.map(function (t) { t.hash; });
}

function buildTransaction(from_keypair, to_address) {
}

app.get('/filled/:to/:amount',
	function (req, res) {
		const client = require('json-client')('https://blockchain.info/q/');

		const amount = client('get', 'getreceivedbyaddress/' + req.params.to + '?confirmations=0')
			.then(function (val) {
				(val - req.params.amount >= 0) ?
					res.status(200).end() :
					res.status(204).end();
			}, function() {
				res.status(500).end();
			});
	});

app.listen(8080);

function buildReceiver(amount, address) {
	return {
		amount: amount,
		bitcoin_amount: amount,
		address: address,
		currency: 'USD',
		description: '14 set(s) of TruckNutz™',
		email: 'bigjohnsbeerstop@aol.com',
	};
}
