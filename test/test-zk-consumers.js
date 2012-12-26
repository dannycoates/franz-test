var cluster = require('../cluster')
var spawn = require('child_process').spawn

function run() {
	var producer = spawn(
		'node',
		[
			'../lib/producer.js',
			'foo',
			'2000'
		],
		{
			cwd: __dirname
		}
	)

	var consumer = spawn(
		'node',
		[
			'../lib/consumer.js',
			'foo',
			'2000'
		],
		{
			cwd: __dirname
		}
	)

	//producer.stdout.pipe(process.stdout)
	consumer.stdout.pipe(process.stdout)

	producer.on('exit', console.log.bind(console, 'producer quit'))

	consumer.on(
		'exit',
		function (code) {
			cluster.stop()
		}
	)
}

cluster.start(1, run)
