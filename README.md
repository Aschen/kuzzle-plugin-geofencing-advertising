# Kuzzle Geofencing Advertising

The purpose of this project is to demonstrate the feasibility and performance of a realtime geofencing advertising backend.

## Specifications

Polygons with 6 sides the size of a few blocks are recorded in a rectangle representing approximately America.

Each polygon is linked to a document stored by Kuzzle in Redis.

A request to the API allows to know if given GPS coordinates are contained in one of the polygons. If this is the case, then the saved document corresponding to the polygon is returned by Kuzzle.

Requests to the API are authenticated.

### About polygons

![10k polygon](images/10000_polygons_usa.png)

![polygon size](images/polygon_size.png)


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

## Benchmarks

### Standalone Kuzzle stack on single node with HTTP

This benchmark is realised with a standalone Kuzzle stack on a Scaleway [C2L server](https://www.scaleway.com/pricing/#anchor_baremetal).

Server specifications: 8 dedicated CPU cores, 32GB RAM, SSD, 600Mb/s network

### Benchmark context

- Number of 6 faces polygons: `300 000`
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


### Standalone Kuzzle stack on single node with Websocket

This benchmark is realised with a standalone Kuzzle stack on a Scaleway [C2L server](https://www.scaleway.com/pricing/#anchor_baremetal).

Server specifications: 8 dedicated CPU cores, 32GB RAM, SSD, 600Mb/s network

### Benchmark context

- Number of 6 faces polygons: `300 000`
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

![progressive loading](images/gatling_progressive_benchmark.png)
