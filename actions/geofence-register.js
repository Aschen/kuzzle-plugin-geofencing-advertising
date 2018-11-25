const
  { Kuzzle } = require('kuzzle-sdk')

const usaBbox = [
  -127.96875,
  26.745610382199022,
  -66.4453125,
  51.6180165487737
]

const host = process.argv[2] || 'localhost'
const count = parseInt(process.argv[3]) || 10000
const bounding_box = (() => {
  if (process.argv[4] === 'usa') {
    return usaBbox
  } else {
    return usaBbox
  }
})()

const kuzzle = new Kuzzle('websocket', { host, port: 7512 });

const run = async () => {
  try {
    await kuzzle.connect();

    await kuzzle.auth.login('local', { username: 'aschen', password: 'aschen' })

    const query = {
      controller: 'geofencing-advertising/geofence',
      action: 'register',
      count,
      bounding_box
    };

    await kuzzle.query(query)
  } catch (error) {
    console.log(error);
  } finally {
    kuzzle.disconnect()
  }
}

run()
