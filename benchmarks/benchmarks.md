# Benchmarks

## Standalone Kuzzle stack on single node

Theses benchmarks are realised with a standalone Kuzzle stack on a Scaleway [C2L server](https://www.scaleway.com/pricing/#anchor_baremetal).
Server specifications: 8 dedicated CPU cores, 32GB RAM, SSD, 600Mb/s netwos

## Benchmark context

Number of 6 faces polygons: 300 000
Zone: USA
Kuzzle authentication: yes
Document storage: Redis
Protocol: Websocket

The test consists in repeating the same request 2000 times with a point matching 1 polygon.

The benchmarks is realised with [bombardier](https://github.com/codesenberg/bombardier/releases) on a Scaleway [C2S server](https://www.scaleway.com/pricing/#anchor_baremetal).
Server specifications: 4 dedicated CPU cores, 8GB RAM, SSD, 300Mb/s network


### 1 co, 2000 req

Statistics        Avg      Stdev        Max
  Reqs/sec       363.76     120.45     500.30
  Latency        2.74ms     5.64ms   209.74ms
  HTTP codes:
    1xx - 0, 2xx - 2000, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:   357.34KB/s

### 2 co, 2000 req

Statistics        Avg      Stdev        Max
  Reqs/sec       442.97      95.98     611.69
  Latency        4.51ms     6.31ms   212.08ms
  HTTP codes:
    1xx - 0, 2xx - 2000, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:   435.04KB/s

### 3 co, 2000 req

Statistics        Avg      Stdev        Max
  Reqs/sec       538.44     115.71     750.46
  Latency        5.57ms     2.95ms    36.17ms
  HTTP codes:
    1xx - 0, 2xx - 2000, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:   528.73KB/s

### 4 co, 2000 req

Statistics        Avg      Stdev        Max
  Reqs/sec       575.91     128.15    1096.59
  Latency        6.96ms     5.28ms   211.29ms
  HTTP codes:
    1xx - 0, 2xx - 2000, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:   563.65KB/s

### 5 co, 2000 req

Statistics        Avg      Stdev        Max
  Reqs/sec       546.58     167.25    1079.65
  Latency        9.17ms     5.55ms    45.62ms
  HTTP codes:
    1xx - 0, 2xx - 2000, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:   535.39KB/s

### 10 co, 2000 req

Statistics        Avg      Stdev        Max
  Reqs/sec       654.31     211.96    1025.34
  Latency       15.27ms     5.04ms    38.90ms
  HTTP codes:
    1xx - 0, 2xx - 2000, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:   642.45KB/s

### 20 co, 2000 req

Statistics        Avg      Stdev        Max
  Reqs/sec       467.36     254.28    1573.73
  Latency       43.01ms    12.82ms    92.94ms
  HTTP codes:
    1xx - 0, 2xx - 2000, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:   452.86KB/s
