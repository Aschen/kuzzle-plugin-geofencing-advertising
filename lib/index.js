const georandom = require('geojson-random')

function generatePolygons(count, bounding_box) {
  // Use http://geojson.io to have a bounding box coordinates
  // Create a rectangle then go to Meta => Add bounding box

  return georandom.point(count, bounding_box).features.map(point => {
    return randomPolygon(point.geometry.coordinates, 10)
  });
}

function randomPolygon(center, size_coef) {
  const rand = () => Math.random() / size_coef

  const p1 = [ center[0] - rand(), center[1] + rand() ];
  const p2 = [ center[0], p1[1] + rand() ]
  const p3 = [ p2[0] + rand(), p1[1] ]

  const p4 = [ p3[0], center[1] - rand() ]
  const p5 = [ center[0],  p4[1] - rand() ]
  const p6 = [ p5[0] - rand(), p4[1]]

  return [p1, p2, p3, p4, p5, p6, p1]
}

class CorePlugin {

  constructor () {
    this.context = null;

    this.config = {
      store: 'redis',
      polygons: 1000,
      boundingBox: [
        -127.96875,
        26.745610382199022,
        -66.4453125,
        51.6180165487737
      ] // USA bounding box
    };

    this.hooks = {
      'core:kuzzleStart': '_initializeKoncorde'
    };

    this.pipes = {};

    this.controllers = {
      'geofence': {
        'add': 'geofenceAdd',
        'test': 'geofenceTest',
        'list': 'geofenceList',
        'geojson': 'generateGeojson',
        'register': 'geofenceRegister',
        'clear': 'geofenceClear',
        'registerStatus': 'geofenceRegisterStatus'
      }
    };

    this.routes = [
      {verb: 'get', url: '/geofence/list', controller: 'geofence', action: 'list'},
      {verb: 'get', url: '/geofence/geojson', controller: 'geofence', action: 'geojson'},
      {verb: 'get', url: '/geofence/register', controller: 'geofence', action: 'register'},
      {verb: 'get', url: '/geofence/clear', controller: 'geofence', action: 'clear'},
      {verb: 'get', url: '/geofence/register/status', controller: 'geofence', action: 'registerStatus'},
      {verb: 'get', url: '/geofence/test', controller: 'geofence', action: 'test'}
    ];

    this.geofencedDocuments = {};
  }

  init (customConfig, context) {
    console.log(customConfig)
    this.config = Object.assign(this.config, customConfig);
    this.context = context;

    this.koncorde = new this.context.constructors.Dsl();
  }

  async geofenceRegister (request) {
    const count = parseInt(request.input.args.count)
    const boundingBox = request.input.args.bounding_box

    this._registerPolygons(count, boundingBox);

    return true;
  }

  async geofenceRegisterStatus () {
    const documents = await this._listDocuments();

    return {
      filterCount: Object.keys(documents).length,
      store: this.config.store
    };
  }

  async generateGeojson () {
    // Use https://www.gmapgis.com/ to load the generated file

    const features = Object.values(await this._listDocuments()).map(document => {
      return {
        "type": "Feature",
        "properties": {
          "style": "#FF0000,5,1,#ff8800,0.4"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [document.polygon]
        }
      }
    })

    const geojson = {
      "type": "FeatureCollection",
      "source": "www.gmapgis.com",
      "features": features
    }

    return geojson;
  }

  async geofenceClear () {
    return this._clearDocuments();
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

    await this._storeDocument(id, document);

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
      return []
    }

    return this._getDocuments(ids);
  }

  async geofenceList (request) {
    return this._listDocuments();
  }

  _initializeKoncorde () {
    this._registerPolygons(this.config.polygons, this.config.boundingBox);
  }


  async _registerPolygons (count, boundingBox) {
    const polygons = generatePolygons(count, boundingBox)

    const promises = polygons.map((polygon, i)=> {
      const document = {
        name: `Document ${i}`,
        polygon
      }

      const filter = {
        geoPolygon: {
          point: {
            points: polygon
          }
        }
      }

      return this.koncorde.register('geofence', 'geofence', filter)
        .then(response => this._storeDocument(response.id, document));
    });

    return Promise.all(promises);
  }

  async _storeDocument (id, document) {
    if (this.config.store === 'redis') {
      return this.context.accessors.sdk.ms.set(`geofence/${id}`, JSON.stringify(document));
    } else {
      this.geofencedDocuments[id] = document;
      return true;
    }
  }

  async _getDocument (id) {
    if (this.config.store === 'redis') {
      const document = await this.context.accessors.sdk.ms.get(`geofence/${id}`);
      return JSON.parse(document);
    } else {
      return this.geofencedDocuments[id];
    }
  }

  async _getDocuments (ids) {
    if (this.config.store === 'redis') {
      return this.context.accessors.sdk.ms.mget(ids.map(id => `geofence/${id}`))
        .then(documents => {
          return documents.map(document => JSON.parse(document))
        });
    } else {
      return ids.map(id => this.geofencedDocuments[id]);
    }
  }

  async _listDocuments () {
    if (this.config.store === 'redis') {
      const keys = await this.context.accessors.sdk.ms.keys(`geofence/*`);
      return this.context.accessors.sdk.ms.mget(keys)
        .then(documents => documents.map(document => JSON.parse(document)));
    } else {
      return this.geofencedDocuments;
    }
  }

  async _clearDocuments () {
    if (this.config.store === 'redis') {
      const keys = await this.context.accessors.sdk.ms.keys(`geofence/*`);
      await this.context.accessors.sdk.ms.del(keys)
      return true
    } else {
      this.geofencedDocuments = {};
      return true;
    }
  }
}

module.exports = CorePlugin;
