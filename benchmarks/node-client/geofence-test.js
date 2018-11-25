const
  { performance } = require('perf_hooks'),
  { Kuzzle } = require('kuzzle-sdk')

const lat = parseInt(process.argv[2])
const lng = parseInt(process.argv[3])
const concurrent = parseInt(process.argv[4]) || 1
const requests = parseInt(process.argv[5]) || 2000
const host = process.argv[6] || 'localhost'

class Client {
  constructor(host, lat, lng, requests) {
    this.requests = requests;

    this.kuzzle = new Kuzzle('websocket', { host, port: 7512 });

    this.query = {
      controller: 'geofencing-marketing/geofence',
      action: 'test',
      lat,
      lng
    }

    this.fail = 0;
    this.success = 0;
  }

  async init () {
    await this.kuzzle.connect();

    await this.kuzzle.auth.login('local', { username: 'aschen', password: 'aschen' });

    return true;
  }

  async start () {
    const promises = []

    for (let i = 0; i < this.requests; i++) {
      promises.push(
        this.kuzzle.query(this.query)
          .then(response => {
            if (response.result.length === 0) {
              this.fail += 1;
            } else {
              this.success += 1;
            }
          })
      )
    }

    await Promise.all(promises)
  }

  stop () {
    if (this.success !== this.requests) {
      console.log("Error", this.fail)
    }
    this.kuzzle.disconnect();
  }
}


const run = async () => {
  const clients = []

  for (let i = 0; i < concurrent; i++) {
    const client = new Client(host, lat, lng, Math.round(requests/concurrent))
    await client.init();

    clients.push(client)
  }

  performance.mark('start')
  await Promise.all(clients.map(client => {
    return client.start()
  }));
  performance.mark('end')
  performance.measure('duration', 'start', 'end');
  const measure = performance.getEntriesByName('duration')[0];
  const requestPerSecond = requests / measure.duration * 1000
  console.log(`Sent ${requests} requests in ${measure.duration} ms`)
  console.log(`Approx ${requestPerSecond} requests/sec`);

}

run()
