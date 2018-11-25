const
  fs = require('fs'),
  georandom = require('geojson-random')

const usaBbox = [
  -127.96875,
  26.745610382199022,
  -66.4453125,
  51.6180165487737
]

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

function polygonsToGeojson(polygons, filename) {
  // Use https://www.gmapgis.com/ to load the generated file

  const features = polygons.map(polygon => {
    return {
      "type": "Feature",
      "properties": {
        "style": "#FF0000,5,1,#ff8800,0.4"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [polygon]
      }
    }
  })

  const geojson = {
    "type": "FeatureCollection",
    "source": "www.gmapgis.com",
    "features": features
  }

  fs.writeFileSync(filename, JSON.stringify(geojson))
}

const polygons = generatePolygons(240000, usaBbox)

polygonsToGeojson(polygons, './polygons.json')
