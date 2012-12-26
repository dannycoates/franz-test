console.assert(process.argv.length > 3)
var Kafka = require('franz-kafka')

var topicName = process.argv[2]
var messagesToSend = +(process.argv[3])

var message = new Buffer(1024)

var kafka = new Kafka({
	zookeeper: ['localhost:2181'],
	compression: 'gzip',
	logger: console
})

function loop(topic) {
	if (!messagesToSend) {
		return kafka.close()
	}
	messagesToSend--
	topic.write(message)
	setTimeout(loop.bind(null, topic), 5)
}

kafka.connect(
	function () {
		var topic = kafka.topic(topicName)
		loop(topic)
	}
)
