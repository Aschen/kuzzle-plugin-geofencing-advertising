# Kuzzle Geofencing Marketing

The purpose of this project is to demonstrate the feasibility and performance of a realtime geofencing marketing backend.

## Specifications

Polygons with 6 sides the size of a few blocks are recorded in a rectangle representing approximately America.

Each polygon is linked to a document stored by Kuzzle in Redis.

A request to the API allows to know if given GPS coordinates are contained in one of the polygons. If this is the case, then the saved document corresponding to the polygon is returned by Kuzzle.

Requests to the API are authenticated.


## Actions

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
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJhc2NoZW4iLCJpYXQiOjE1NDMxMDUzMDQsImV4cCI6MTU0MzEwODkwNH0.WnUCDCwPXRUA1JE_4e7kbkIShQiM0MtW0admTWpKI1g" "http://localhost:7512/_plugin/geofencing-marketing/geofence/test?lat=-86.99962414458622&lng=31.431421096655942
```

### geofence/geojson

Get the polygons list in GeoJSON format.

Execute the script `action/get-geojson.js` to create a `polygons.json` file containing the polygons.

Use https://www.gmapgis.com/ to load the generated file in a world map.

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

The test consists in repeating the same request 2000 times with a point matching 1 polygon.

The benchmark is realized with a [custom websocket node.js client](benchmarks/node-client/geofence-test.js) based on the [javascript SDK 6](https://github.com/kuzzleio/sdk-javascript/tree/6-beta).

Server specifications: 4 dedicated CPU cores, 8GB RAM, SSD, 300Mb/s network

| concurrent connections | avg latency (ms) | request/s |
| ------------ | ------- | --------- |
| 1 | ... | 1023 |
| 2 | ... | 600 |
| 3 | ... | 619 |
| 4 | ... | 605 |
| 5 | ... | 600 |
| 10 | ... | 584 |
| 20 | ... | 531 |
