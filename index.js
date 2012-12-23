var Kafka = require('franz-kafka')
var cluster = require('./cluster')

var message = new Buffer(10 * 1024)
//message.fill('x')

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
			console.log('connected')
			var foo = kafka.topic('foo')

			var i = setInterval(foo.write.bind(foo, message), 10)
			setTimeout(
				function () {
					clearInterval(i)
					kafka.close()
					cluster.stop()
				},
				30000
			)
		}
	)
	kafka.connect()
}

cluster.start(2, run)
