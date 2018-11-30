# Kuzzle Geofencing Advertising

The purpose of this project is to demonstrate the feasibility and performance of a realtime geofencing advertising backend.

- [Kuzzle Geofencing Advertising](#kuzzle-geofencing-advertising)
  * [Specifications](#specifications)
    + [About polygons](#about-polygons)
  * [Benchmarks](#benchmarks)
    + [Kuzzle cluster with Websocket](#kuzzle-cluster-with-websocket)
    + [Kuzzle single node with Websocket](#standalone-kuzzle-stack-on-single-node-with-websocket)
    + [Kuzzle single node with HTTP](#standalone-kuzzle-stack-on-single-node-with-http)
  * [Controller Actions](#controller-actions)
    + [geofence/register](#geofence-register)
    + [geofence/test](#geofence-test)
    + [geofence/geojson](#geofence-geojson)
  * [Tools](#tools)
    + [geofence-register](#geofence-register)
    + [geofence-find-match](#geofence-find-match)
    + [get-geojson](#get-geojson)

## Specifications

Polygons with 6 sides the size of a few blocks are recorded in a rectangle representing approximately America.

Each polygon is linked to a document stored by Kuzzle in Redis.

A request to the API allows to know if given GPS coordinates are contained in one of the polygons. If this is the case, then the saved document corresponding to the polygon is returned by Kuzzle.

Requests to the API are authenticated.

### About polygons

![10k polygon](images/10000_polygons_usa.png)

![polygon size](images/polygon_size.png)

## Benchmarks

### Kuzzle cluster with Websocket

This benchmark is realised with a Kuzzle cluster on AWS [m5.large instances](https://aws.amazon.com/ec2/instance-types/m5/).

Server specifications: 2 vCPU, 8GB RAM

### Benchmark context

- Number of 6 vertices polygons: `300 000`
- Overlaping polygons: `true`
- Accuracy: `<1m`
- Zone: `USA`
- Kuzzle authentication: `yes`
- Document storage: `Redis`
- Protocol: `Websocket`
- Node.js: `8.11.0`

The test consists in repeating the same request 2000 times with a point matching 1 polygon.

The benchmark is realized with [Gatling](https://gatling.io) and a [websocket scenario](benchmarks/gatling/Websocket.scala).

Gatling server is a [c5.2xlarge instance](https://aws.amazon.com/ec2/instance-types/c5/).

Server specifications: 9 vCPU, 16 GB RAM

![benchmark 4 node 400 users](images/cluster_4_node_benchmark.png)

| Kuzzle nodes | Concurrent users | Requests / second | Requests / second / user | Requests / second / node | Latency (ms) | Full benchmark                                                                                                                  |
|--------------|------------------|-------------------|--------------------------|--------------------------|--------------|---------------------------------------------------------------------------------------------------------------------------------|
| 2            | 20               | 4700              | 235                      | 2350                     | 3            | [2 nodes, 80 users in 40 seconds, 2000 requests each](https://aschen.github.io/kuzzle-plugin-geofencing-advertising/benchmarks/gatling/results/websocket-20181129155157651/index.html) |
| 2            | 120              | 6000              | 50                       | 3000                     | 17           | [2 nodes, 120 users in 12 seconds, 2000 requests each](https://aschen.github.io/kuzzle-plugin-geofencing-advertising/benchmarks/gatling/results/websocket-20181129155709939/index.html) |
| 2            | 200              | 7000              | 35                       | 3500                     | 31           | [2 nodes, 200 users in 20 seconds, 2000 requests each](https://aschen.github.io/kuzzle-plugin-geofencing-advertising/benchmarks/gatling/results/websocket-20181129155408633/index.html) |
| 3            | 120              | 8500              | 71                       | 2833.33                  | 12           | [3 nodes, 120 users in 12 seconds, 2000 requests each](https://aschen.github.io/kuzzle-plugin-geofencing-advertising/benchmarks/gatling/results/websocket-20181129160824325/index.html) |
| 3            | 190              | 9000              | 47                       | 3000                     | 16           | [3 nodes, 200 users in 20 seconds, 2000 requests each](https://aschen.github.io/kuzzle-plugin-geofencing-advertising/benchmarks/gatling/results/websocket-20181129160654693/index.html) |
| 3            | 200              | 10000             | 50                       | 3333.33                  | 21           | [3 nodes, 200 users in 10 seconds, 2000 requests each](https://aschen.github.io/kuzzle-plugin-geofencing-advertising/benchmarks/gatling/results/websocket-20181129161004854/index.html) |
| 4            | 120              | 10000             | 83                       | 2500                     | 8            | [4 nodes, 120 users in 12 seconds, 2000 requests each](https://aschen.github.io/kuzzle-plugin-geofencing-advertising/benchmarks/gatling/results/websocket-20181129162052379/index.html) |
| 4            | 180              | 11000             | 61                       | 2750                     | 11           | [4 nodes, 200 users in 20 seconds, 2000 requests each](https://aschen.github.io/kuzzle-plugin-geofencing-advertising/benchmarks/gatling/results/websocket-20181129162203432/index.html) |
| 4            | 200              | 11000             | 55                       | 2750                     | 19           | [4 nodes, 200 users in 10 seconds, 2000 requests each](https://aschen.github.io/kuzzle-plugin-geofencing-advertising/benchmarks/gatling/results/websocket-20181129162323195/index.html) |
| 4            | 400              | 15000             | 38                       | 3750                     | 26           | [4 nodes, 400 users in 20 seconds, 2000 requests each](https://aschen.github.io/kuzzle-plugin-geofencing-advertising/benchmarks/gatling/results/websocket-20181129163117542/index.html) |

### Standalone Kuzzle stack on single node with Websocket

This benchmark is realised with a standalone Kuzzle stack on a Scaleway [C2L server](https://www.scaleway.com/pricing/#anchor_baremetal).

Server specifications: 8 dedicated CPU cores, 32GB RAM, SSD, 600Mb/s network

### Benchmark context

- Number of 6 vertices polygons: `300 000`
- Overlaping polygons: `true`
- Accuracy: `<1m`
- Zone: `USA`
- Kuzzle authentication: `yes`
- Document storage: `Redis`
- Protocol: `Websocket`
- Node.js: `8.11.0`

The test consists in repeating the same request 2000 times with a point matching 1 polygon.

The benchmark is realized with [Gatling](https://gatling.io) and a [websocket scenario](benchmarks/gatling/Websocket.scala) .

Server specifications: 4 dedicated CPU cores, 8GB RAM, SSD, 300Mb/s network

| concurrent connections | avg latency (ms) | avg request/s | max requests/s |
| ------------ | ------- | ------- | ------- |
| 1 | 3 | 222 | 388 |
| 2 | 3 | 400 | 641 |
| 3 | 4 | 546 | 757 |
| 4 | 6 | 602 | 853 |
| 5 | 6 | 667 | 980 |
| 10 | 10 | 910 | 1231 |
| 20 | 16 | 1144 | 1455 |

### Progressive loading

Same test but progressively load 120 users with 200 requests each.

The full benchmark report is available [here](https://aschen.ovh/kuzzle_geofencing_progressive_benchmark)

![progressive loading](images/gatling_progressive_benchmark.png)


### Standalone Kuzzle stack on single node with HTTP

This benchmark is realised with a standalone Kuzzle stack on a Scaleway [C2L server](https://www.scaleway.com/pricing/#anchor_baremetal).

Server specifications: 8 dedicated CPU cores, 32GB RAM, SSD, 600Mb/s network

### Benchmark context

- Number of 6 vertices polygons: `300 000`
- Overlaping polygons: `true`
- Accuracy: `<1m`
- Zone: `USA`
- Kuzzle authentication: `yes`
- Document storage: `Redis`
- Protocol: `HTTP`
- Node.js: `8.11.0`

The test consists in repeating the same request 2000 times with a point matching 1 polygon.

The benchmark is realised with [bombardier](https://github.com/codesenberg/bombardier/releases) on a Scaleway [C2S server](https://www.scaleway.com/pricing/#anchor_baremetal).

Server specifications: 4 dedicated CPU cores, 8GB RAM, SSD, 300Mb/s network

| concurrent connections | avg latency (ms) | request/s |
| ------------ | ------- | --------- |
| 1 | 2.74 | 363 |
| 2 | 4.51 | 442 |
| 3 | 5.57 | 538 |
| 4 | 6.96 | 575 |
| 5 | 9.17 | 546 |
| 10 | 15.27 | 654 |
| 20 | 43.01 | 467 |


## Controller Actions

### geofence/register

Randomly generate polygons and register them in geofencing filters.

Parameters:
  - `count`: number of polygons to register
  - `bounding_box`: area where to generate polygons

Use http://geojson.io to have bounding box coordinates.
 - create a rectangle
 - go to "Meta" menu
 - click "add bounding box"

Bounding boxes:
 - USA bounding box  `[ -127.96875, 26.745610382199022, -66.4453125, 51.6180165487737]`

 Use the script `actions/geofence-register.js` to register 10 000 polygons in the USA.

 ### geofence/test

 Test if GPS coordinates are included in one of the registered polygons and return the corresponding documents.

 Parameters:
  - `lat`: latitude
  - `lng`: longitude

Example:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJhc2NoZW4iLCJpYXQiOjE1NDMxMDUzMDQsImV4cCI6MTU0MzEwODkwNH0.WnUCDCwPXRUA1JE_4e7kbkIShQiM0MtW0admTWpKI1g" "http://localhost:7512/_plugin/geofencing-advertising/geofence/test?lat=-86.99962414458622&lng=31.431421096655942
```

### geofence/geojson

Get the polygons list in GeoJSON format.

Execute the script `action/get-geojson.js` to create a `polygons.json` file containing the polygons.

Use https://www.gmapgis.com/ to load the generated file in a world map.

## Tools

### geofence-register

This script send a request to register polygons filters.

```
Usage: node actions/geofence-register.js <host> <filter count> <bounding box>
```

The availables bounding boxes are: `usa`

Example: register 100 000 polygons filters in USA
```
node actions/geofence-register.js localhost 100000 usa
```

### geofence-find-match

This script return random points that match at least one polygon.

It also print curl, bombardier and custom node benchmark command for each point.


```
Usage: node actions/geofence-find-match.js <host> <bounding box>
```

The availables bounding boxes are: `usa`

Example:
```
node actions/geofence-find-match.js localhost usa
```

### get-geojson

This script get the registered polygons in GeoJSON format.

The generated file can be viewed online on https://www.gmapgis.com/, just drag'n'drop the file.

```
Usage: node actions/get-geojson.js <host> <filename>
```

Example:
```
node actions/get-geojson.js localhost ./polygons.json
```
