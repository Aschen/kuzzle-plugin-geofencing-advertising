#!/bin/bash

echo $JAVA_OPTS

docker run -it --rm \
  -v "$(pwd)/benchmarks/gatling/user-files/:/opt/gatling/user-files" \
  -v "$(pwd)/benchmarks/gatling/results/:/opt/gatling/results" \
  -e JAVA_OPTS="$JAVA_OPTS" \
  denvazh/gatling

echo "run the following command to serv report file over http on port 8000"
echo "ruby -run -e httpd ./benchmarks/gatling/results -p 8000"
