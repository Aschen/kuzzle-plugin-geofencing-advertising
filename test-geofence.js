const
  { Kuzzle } = require('kuzzle-sdk'),
  georandom = require('geojson-random')

const kuzzle = new Kuzzle('websocket', { host: 'localhost', port: 7512 });

const bbox = [ [ 9.471423234217813, 44.93934071273322 ],
[ 8.494665524555177, 44.18206053074484 ],
[ 5.386720451560151, 44.59640163026614 ],
[ 5.828167895121794, 40.82805246658529 ],
[ 3.372264214357266, 41.16896628450789 ],
[ 3.8973876550294357, 38.57588072206692 ],
[ 2.1147363253488365, 34.432091212159314 ],
[ 6.13426657226654, 29.5077126911615 ],
[ 7.770877183702435, 37.6220340438922 ],
[ 15.431973917851838, 33.63105279222404 ],
[ 9.471423234217813, 44.93934071273322 ] ]

const run = async () => {
  try {
    await kuzzle.connect();

    const [lat, lng] = georandom.point(1).features[0].geometry.coordinates
    console.log(lat, lng)
    const query = {
      controller: 'kuzzle-core-plugin-boilerplate/geofence',
      action: 'test',
      lat,
      lng
    };

    const response = await kuzzle.query(query, {})
    console.log(response)

  } catch (error) {
    console.log(error);
  } finally {
    kuzzle.disconnect()
  }
}

run()

