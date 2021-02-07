import axios from 'axios';
import { create } from 'xmlbuilder2';
import { writeFileSync } from 'fs';

const stats = await axios.get('https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/proj_19rp3?freq=A&projection=BSL&unit=PER&age=TOTAL&time=2020&sex=T');
const nuts = await Promise.all([
  axios.get('https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v1/2016/4326/nutspt_3.json'),
  axios.get('https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v1/2016/IC/4326/nutspt_3.json'),
  axios.get('https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v1/2016/GP/4326/nutspt_3.json'),
  axios.get('https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v1/2016/GF/4326/nutspt_3.json'),
  axios.get('https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v1/2016/RE/4326/nutspt_3.json'),
  axios.get('https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v1/2016/YT/4326/nutspt_3.json')
])
  .then(nuts => nuts.reduce((prev, curr) => [...prev, ...curr.data.features], []));

const nutsCodes = Object.keys(stats.data.dimension.geo.category.index);
const labels = stats.data.dimension.geo.category.label;
const highestPopulation = Object.values(stats.data.value).sort((a, b) => b - a)[0];

const placemarks = Object.keys(stats.data.value).map(region => {
  const id = nutsCodes[region];
  const population = stats.data.value[region];
  const cityName = labels[id];
  const nut = nuts.find(feature => feature.properties.id === id);

  return {
    '@id': id,
    name: cityName,
    population,
    weight: population / highestPopulation,
    Point: {
      coordinates: nut.geometry.coordinates.join(',')
    }
  };
});

const xml = {
  kml: {
    '@xmlns': 'http://earth.google.com/kml/2.0',
    '@xmlns:atom': 'http://www.w3.org/2005/Atom',
    Document: {
      name: 'Population on 1st January by age, sex, type of projection and NUTS 3 region',
      'atom:link': {
        '@href': 'https://ec.europa.eu/eurostat'
      },
      Folder: {
        Placemark: placemarks
      }
    }
  }
};

writeFileSync('data/population.kml', create(xml).end({ prettyPrint: true }));