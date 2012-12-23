var Child = require('child_process')
var fs = require('fs')
var ejs = require('ejs')

var kafkaPropertiesTemplate = fs.readFileSync('config/server.properties.ejs', 'utf8')
var classPath = ":kafka/bin/../project/boot/scala-2.8.0/lib/scala-compiler.jar:kafka/bin/../project/boot/scala-2.8.0/lib/scala-library.jar:kafka/bin/../core/target/scala_2.8.0/kafka-0.7.2.jar:kafka/bin/../core/lib/*.jar:kafka/bin/../perf/target/scala_2.8.0/kafka-perf-0.7.2.jar:kafka/bin/../core/lib_managed/scala_2.8.0/compile/jopt-simple-3.2.jar:kafka/bin/../core/lib_managed/scala_2.8.0/compile/log4j-1.2.15.jar:kafka/bin/../core/lib_managed/scala_2.8.0/compile/snappy-java-1.0.4.1.jar:kafka/bin/../core/lib_managed/scala_2.8.0/compile/zkclient-0.1.jar:kafka/bin/../core/lib_managed/scala_2.8.0/compile/zookeeper-3.3.4.jar"

var zookeeper = null
var kafkas = {}

function noop() {}

function cleanup(cb) {
		Child.exec("rm -rf tmp; mkdir -p ./tmp/config", cb)
}

function spawnZookeeper() {
	return Child.spawn(
		"java",
		[
			"-Xmx512M",
			"-server",
			"-Dlog4j.configuration=file:kafka/bin/../config/log4j.properties",
			"-cp", classPath,
			"org.apache.zookeeper.server.quorum.QuorumPeerMain",
			"config/zookeeper.properties"
		]
	)
}

function spawnKafka(id) {
	var configFilename = 'tmp/config/server' + id + '.properties'
	fs.writeFileSync(
		configFilename,
		ejs.render(kafkaPropertiesTemplate, { brokerId: id })
	)
	return Child.spawn(
		"java",
		[
			"-Xmx512M",
			"-server",
			"-Dlog4j.configuration=file:kafka/bin/../config/log4j.properties",
			"-cp", classPath,
			"kafka.Kafka",
			configFilename
		]
	)
}

function start(kafkaInstances, cb) {
	cleanup(
		function (err) {
			if (err) {
				return cb(err)
			}
			zookeeper = spawnZookeeper()
			zookeeper.once('exit', cleanup.bind(null, noop))
			for (var i = 0; i < kafkaInstances; i++) {
				var kafka = spawnKafka(i)
				kafka.once('exit', kafkaDone.bind(null, i))
				kafkas[i] = kafka
			}
			cb()
		}
	)
}

function kafkaDone(id) {
	delete kafkas[id]
	if (Object.keys(kafkas).length === 0) {
		zookeeper.kill('SIGKILL')
	}
}

function stop(id) {
	if (id === undefined) {
		// all
		Object.keys(kafkas).forEach(
			function (id) {
				kafkas[id].kill('SIGKILL')
			}
		)
	}
	else {
		kafkas[id].kill('SIGKILL')
	}
}

module.exports = {
	start: start,
	stop: stop
}
