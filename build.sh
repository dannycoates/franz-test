curl http://www.eng.lsu.edu/mirrors/apache/incubator/kafka/kafka-0.7.2-incubating/kafka-0.7.2-incubating-src.tgz -o kafka.tgz
tar xzvf kafka.tgz
rm kafka.tgz
mv kafka-0.7.2-incubating-src kafka
cd kafka
./sbt update
./sbt package
