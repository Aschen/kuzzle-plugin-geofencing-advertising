#!/bin/bash

echo $JAVA_OPTS

docker run -it --rm \
  -v "$(pwd)/benchmarks/gatling/user-files/:/opt/gatling/user-files" \
  -v "$(pwd)/benchmarks/gatling/results/:/opt/gatling/results" \
  -e JAVA_OPTS="$JAVA_OPTS" \
  denvazh/gatling
