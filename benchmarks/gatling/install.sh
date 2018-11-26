#!/bin/bash

wget https://repo1.maven.org/maven2/io/gatling/highcharts/gatling-charts-highcharts-bundle/3.0.1.1/gatling-charts-highcharts-bundle-3.0.1.1-bundle.zip

unzip gatling-charts-highcharts-bundle-3.0.1.1-bundle.zip

cp benchmarks/gatling/user-files/Websocket.scala gatling-charts-highcharts-bundle-3.0.1.1/user-files/simulations/computerdatabase/.
