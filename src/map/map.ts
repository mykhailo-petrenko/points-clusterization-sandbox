import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import {MOCK_RESPONSE} from './mock_response';
import { feature, featureCollection } from '@turf/turf';

const map = L.map('map').setView([50.45, 30.523333], 13);

L
  .tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  .addTo(map);



const points = MOCK_RESPONSE
  .map((item) => {
    if (!item?.preview?.geometry) {
      return;
    }

    return {
      id: item.preview._id,
      geometry: item.preview.geometry,
    }
  })
  .filter((item) => !!item);

console.log(points);

let features = points.map((p) => {
  return feature(p.geometry);
});

const collection = featureCollection(features);

console.log(collection);

L.Icon.Default.imagePath = '/leaflet/';


L.geoJSON(collection).addTo(map);
