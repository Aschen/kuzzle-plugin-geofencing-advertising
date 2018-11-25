const
  fs = require('fs'),
  { Kuzzle } = require('kuzzle-sdk')

const host = process.argv[2] || 'localhost'
const filename = process.argv[3] || './polygons.json'

const kuzzle = new Kuzzle('websocket', { host, port: 7512 });

const run = async () => {
  try {
    await kuzzle.connect();

    await kuzzle.auth.login('local', { username: 'aschen', password: 'aschen' })

    const query = {
      controller: 'geofencing-advertising/geofence',
      action: 'geojson'
    };

    const response = await kuzzle.query(query);

    fs.writeFileSync(filename, JSON.stringify(response.result));
  } catch (error) {
    console.log(error);
  } finally {
    kuzzle.disconnect()
  }
}

run()
