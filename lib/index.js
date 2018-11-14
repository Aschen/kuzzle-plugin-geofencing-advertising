/**
 * Plugins must be valid Node.js requirable modules,
 * usually shipped as a directory and containing either:
 *
 *  - an `index.js` file in its root directory, exporting a Javascript class
 *  - a well-formed `package.json` file in its root directory,
 *    specifying the path of the main requirable file in the `main` field.
 *
 * To determine the Plugin name, Kuzzle looks for the `name` field
 * in the `manifest.json` file.
 * @deprecated  - If no `manifest.json` file is found, Kuzzle will fall back
 * to the `package.json` file, if there is one. Otherwise, an exception is thrown
 * and Kuzzle will fail to start.
 *
 * @see https://docs.kuzzle.io/plugins-reference/plugins-creation-prerequisites/
 */
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
        'list': 'geofenceList'
      }
    };

    this.routes = [
      {verb: 'get', url: '/geofence/list', controller: 'geofence', action: 'list'},
      {verb: 'get', url: '/geofence/test', controller: 'geofence', action: 'test'}
    ];

    this.geofencedDocuments = {}
  }

  init (customConfig, context) {
    this.config = Object.assign(this.config, customConfig);
    this.context = context;

    this.koncorde = new this.context.constructors.Dsl()
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
      documents: this.geofencedDocuments,
      size: Object.keys(this.geofencedDocuments).length
    }
  }
}

module.exports = CorePlugin;
