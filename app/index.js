'use strict';

const isReal = false;

const express = require('express');
const hbs =     require('express-handlebars');
const stripe =  require('stripe')(
	isReal ?
		'sk_live_DWFxOgCGi6MPNxnptLe4on7R' :
		'sk_test_XBHL4SYaHG2FPMiXzDYqIWqQ'
);
const bitcoin = require('bitcoinjs-lib');

var app =
	module.exports =
	express();

app.use(express.static('static'));
app.engine('.hbs', hbs({extname: '.hbs'}));
app.set('view engine', 'handlebars');

function dp(n, str) {
	const spl = str.toString().split('.');
	if (spl.length < 2)
		return str;

	const output =
		spl[0] +
		spl[1] ?
			('.' + spl[1].substring(0,2)) :
			'';
	return output;
}

app.get('/:amount',
	function (req, res) {
		const to = "Big Stu's Beer and Truck Emporium";
		const wallet = bitcoin.ECPair.makeRandom({ rng: function() {
				const str = (
								require('crypto')
								.Hash('MD5')
								.update(
									new Buffer(to +
										Math.random() *
										Date.now().toString()
									)
								)
								.digest('hex')
							).toString().substring(0, 32);
				return new Buffer(str, 'ascii');
			}
		});
		const address = wallet.getAddress();
		const recv = buildReceiver(req.params.amount, address);
		const btcRatio = 1000000;
		const btc = (recv.bitcoin_amount / btcRatio);
		const gbp = dp(2, btc / 0.0063);

		res.render('index.html.hbs', {
			description: recv.description,
			address: recv.address,
			satoshi: recv.bitcoin_amount,
			amount: btc,
			gbp: gbp,
			friendly: encodeURIComponent(to),
			message: encodeURIComponent('£' + gbp + '\n' + recv.description),
			wif: wallet.toWIF(),
		});

	});

function getTransactions(address) {
	const client = require('json-client')('https://blockchain.info/');
	const addressInfo = client('get', 'address/' + address + '?format=json');

	const transactions = addressInfo.txs;

	return transactions;
}

function buildTransaction(from_keypair, to_address) {
	const transactionBuilder = new bitcoin.TransactionBuilder();
	const trs = getTransactions(from_keypair.getAddress());
	var tot = 0;

	for (var i = 0; i < trs.length; i++) {
		const val = trs[i].out
					.map(function (a) { return a.value; })
					.reduce(function (last, cur) { return last + cur; });
		tot += val;

		transactionBuilder.addInput(trs[i].hash, val);
	}

	transactionBuilder.addOutput(to_address, tot);
	transactionBuilder.sign(0, from_keypair);

	return transactionBuilder.build().toHex();
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
	}
);

app.get('/drain/:wif',
	function (req, res) {
		const wallet = bitcoin.ECPair.fromWIF(req.params.wif);
		buildTransaction(
			wallet,
			'17FoAFb3vVh4XnGxXcJVrFU9KYXEHDUE2b'
		);
	}
);

app.listen(process.env.PORT || 8080);

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
