console.assert(process.argv.length > 3)
var Kafka = require('franz-kafka')

var topicName = process.argv[2]
var messagesToReceive = process.argv[3]

var kafka = new Kafka({
	zookeeper: ['localhost:2181'],
	compression: 'gzip',
	logger: console
})

kafka.connect(
	function () {
		var topic = kafka.topic(topicName)
		function onData() {
			messagesToReceive--
			process.stdout.write('x')
			if (!messagesToReceive) {
				topic.removeListener('data', onData)
				kafka.close()
			}
		}
		topic.on('data', onData)
		topic.resume()
	}
)
