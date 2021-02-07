import fetch from 'node-fetch';
import { create } from 'xmlbuilder2';
import { writeFileSync } from 'fs';

const kml = create({ version: '1.0', encoding: 'UTF-8' })
  .ele('kml', {
    'xmlns': 'http://earth.google.com/kml/2.0',
    'xmlns:atom': 'http://www.w3.org/2005/Atom'
  })
  .ele('Document')
  .ele('name').txt('Population on 1st January by age, sex, type of projection and NUTS 3 region').up()
  .ele('atom:link', { href: 'https://ec.europa.eu/eurostat' }).up()
  .ele('Folder');

const responseStats = await fetch('https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/proj_19rp3?freq=A&projection=BSL&unit=PER&age=TOTAL&time=2020&sex=T');
const stats = await responseStats.json();

const responseNuts = await fetch('https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/4326/nutspt_3.json');
const nuts = await responseNuts.json();

const nutsCodes = Object.keys(stats.dimension.geo.category.index);
const labels = stats.dimension.geo.category.label;

Object.keys(stats.value).forEach(region => {
  const population = stats.value[region];
  const id = nutsCodes[region];
  const cityName = labels[id];
  const coordinates = nuts.features.find(features => features.properties.id === id).geometry.coordinates;

  kml
    .ele('Placemark', { id })
    .ele('name').txt(cityName).up()
    .ele('population').txt(population).up()
    .ele('Point')
    .ele('coordinates').txt(coordinates.join(',')).up().up().up()
});

writeFileSync('data/population.kml', kml.end({ prettyPrint: true }));