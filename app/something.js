function getTransactions(address) {
	const client = require('json-client')('https://blockchain.info/');
	return client('get', 'address/' + address + '?format=json')
		.then(function (v) { return v.txs; });
}

function buildTransaction(from_keypair, to_address) {
	const transactionBuilder = new bitcoin.TransactionBuilder();
	return getTransactions(from_keypair.getAddress()).then(function (trs) {
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
	});
}

module.exports = buildTransaction(require('bitcoinjs-lib').ECPair.fromWIF('KzcRviEWfwFAD9tsanX6HVQJgdJ8wuktnfnMAfUBAo5dBkmXAYAq'), '17FoAFb3vVh4XnGxXcJVrFU9KYXEHDUE2b');