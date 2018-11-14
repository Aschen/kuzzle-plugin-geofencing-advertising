const
  { Kuzzle } = require('kuzzle-sdk'),
  georandom = require('geojson-random')

const kuzzle = new Kuzzle('websocket', { host: '51.15.139.200', port: 7512 });

const generatePolygon = () => georandom.polygon(1).features[0].geometry.coordinates[0].map(c => [c[1], c[0]])

const run = async () => {
  try {
    await kuzzle.connect();

    const promises = []
    for (let i = 0; i < 2000; ++i) {

      const points = generatePolygon();
      const document = {
        name: `Document ${i}`,
        points
      }

      const query = {
        controller: 'kuzzle-core-plugin-boilerplate/geofence',
        action: 'add',
        document,
        polygon: points
      };
      console.log(points)
      promises.push(kuzzle.query(query, {}))
    }

    await Promise.all(promises)
  } catch (error) {
    console.log(error);
  } finally {
    kuzzle.disconnect()
  }
}

run()

