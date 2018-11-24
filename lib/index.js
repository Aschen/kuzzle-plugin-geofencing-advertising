const georandom = require('geojson-random')

class CorePlugin {

  constructor () {
    this.context = null;

    this.config = {
      param: '<default value>'
    };

    this.hooks = {};

    this.pipes = {};

    this.controllers = {
      'geofence': {
        'add': 'geofenceAdd',
        'test': 'geofenceTest',
        'list': 'geofenceList',
        'generate': 'geofenceGenerate'
      }
    };

    this.routes = [
      {verb: 'get', url: '/geofence/list', controller: 'geofence', action: 'list'},
      {verb: 'get', url: '/geofence/generate', controller: 'geofence', action: 'generate'},
      {verb: 'get', url: '/geofence/test', controller: 'geofence', action: 'test'}
    ];

    this.geofencedDocuments = {}
  }

  init (customConfig, context) {
    this.config = Object.assign(this.config, customConfig);
    this.context = context;

    this.koncorde = new this.context.constructors.Dsl()
  }

  async geofenceGenerate (request) {
    const count = parseInt(request.input.args.count)

    let promises = []
    for (let i = 0; i < count; ++i) {
      const points = generatePolygon();
      const document = {
        name: `Document ${i}`,
        points
      }

      const filter = {
        geoPolygon: {
          point: {
            points: generatePolygon()
          }
        }
      }

      const p = this.koncorde.register('geofence', 'geofence', filter)
        .then(response => this.geofencedDocuments[response.id] = document)
      promises.push(p)
    }

    await Promise.all(promises)

    return true
  }

  async geofenceAdd (request) {
    const polygon = request.input.args.polygon
    const document = request.input.args.document

    const filter = {
      geoPolygon: {
        point: {
          points: polygon
        }
      }
    }

    const { id } = await this.koncorde.register('geofence', 'geofence', filter)
    console.log('geofence id', id)

    this.geofencedDocuments[id] = document

    return true
  }

  async geofenceTest (request) {
    const lat = request.input.args.lat
    const lng = request.input.args.lng

    const document = {
      point: [lat, lng]
    }

    const ids = this.koncorde.test('geofence', 'geofence', document)

    if (ids.length === 0) {
      return false
    }

    return this.geofencedDocuments[ids[0]]
  }

  async geofenceList (request) {
    return {
      size: Object.keys(this.geofencedDocuments).length
    }
  }
}

module.exports = CorePlugin;
