import 'ol/ol.css';
import KML from 'ol/format/KML';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import { Heatmap as HeatmapLayer, Tile as TileLayer } from 'ol/layer';

var vector = new HeatmapLayer({
  source: new VectorSource({
    url: 'data/population.kml',
    format: new KML({
      extractStyles: false,
    }),
  }),
  weight: (feature) => feature.get('weight')
});

var raster = new TileLayer({
  source: new OSM(),
});

new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [966489, 6465508],
    zoom: 4.5,
  }),
});
