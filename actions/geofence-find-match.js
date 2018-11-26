const
  georandom = require('geojson-random'),
  { Kuzzle } = require('kuzzle-sdk')

const usaBbox = [
  -127.96875,
  26.745610382199022,
  -66.4453125,
  51.6180165487737
]

const host = process.argv[2] || 'localhost'
const count = 100
const bounding_box = (() => {
  if (process.argv[3] === 'usa') {
    return usaBbox
  } else {
    return usaBbox
  }
})();

const kuzzle = new Kuzzle('websocket', { host, port: 7512 });

const run = async () => {
  try {
    await kuzzle.connect();

    const jwt = await kuzzle.auth.login('local', { username: 'aschen', password: 'aschen' })

    const promises = georandom.point(count, bounding_box).features.map(point => {
      const [lat, lng] = point.geometry.coordinates;

      const query = {
        controller: 'geofencing-advertising/geofence',
        action: 'test',
        lat,
        lng
      };

      return kuzzle.query(query).then(response => {
        if (response.result.length > 0) {
          console.log(`${lat} ${lng} match ${response.result.length} documents`);
          console.log(`curl -H "Authorization: Bearer ${jwt}" "http://${host}:7512/_plugin/geofencing-advertising/geofence/test?lat=${lat}&lng=${lng}&pretty"`);
          console.log(`bombardier -c 1 -n 1000 -H "Authorization: Bearer ${jwt}" "http://${host}:7512/_plugin/geofencing-advertising/geofence/test?lat=${lat}&lng=${lng}&pretty"`);
          console.log(`node benchmarks/node-client/geofence-test.js ${lat} ${lng} 1 2000 ${host}`);
          console.log(`JAVA_OPTS="-Dhost=${host} -Dlat=${lat} -Dlng=${lng} -Drequests=2000 -Dusers=1" bash benchmarks/gatling/docker.sh`);
          console.log('');
        }
      });
    })

    await Promise.all(promises);
  } catch (error) {
    console.log(error);
  } finally {
    kuzzle.disconnect()
  }
}

run()
