var Kafka = require('franz-kafka')
var cluster = require('../cluster')

var message = new Buffer(10 * 1024)

function run() {

	var kafka = new Kafka({
		zookeeper: ['localhost:2181'],
		compression: 'gzip',
		queueTime: 2000,
		batchSize: 200,
		logger: console
	})

	kafka.on(
		'connect',
		function (err) {
			var foo = kafka.topic('foo')

			foo.on('data', function (data) {
				process.stdout.write('x')
			})
			foo.resume()
			var i = setInterval(foo.write.bind(foo, message), 10)
			setTimeout(
				function () {
					clearInterval(i)
					kafka.close()
					cluster.stop()
				},
				1000 * 30
			)
		}
	)
	kafka.connect()
}

cluster.start(2, run)
