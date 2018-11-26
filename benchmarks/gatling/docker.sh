#!/bin/bash

docker run -it --rm \
  -v "$(pwd)/benchmarks/gatling/user-files/:/opt/gatling/user-files" \
  -v "$(pwd)/benchmarks/gatling/results/:/opt/gatling/results" \
  denvazh/gatling
