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
const count = parseInt(process.argv[3]) || 100
const bounding_box = (() => {
  if (process.argv[4] === 'usa') {
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
        controller: 'kuzzle-core-plugin-boilerplate/geofence',
        action: 'test',
        lat,
        lng
      };

      return kuzzle.query(query).then(response => {
        if (response.result.length > 0) {
          console.log(`${lat} ${lng} match ${response.result.length} documents`);
          console.log(`curl -H "Authorization: Bearer ${jwt}" "http://${host}:7512/_plugin/kuzzle-core-plugin-boilerplate/geofence/test?lat=${lat}&lng=${lng}&pretty"`);
          console.log(`bombardier -c 1 -n 1000 -H "Authorization: Bearer ${jwt}" "http://${host}:7512/_plugin/kuzzle-core-plugin-boilerplate/geofence/test?lat=${lat}&lng=${lng}&pretty"`);
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
