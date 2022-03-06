import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import {MOCK_RESPONSE} from './mock_response';
import { clustersDbscan, feature, featureCollection, Point } from '@turf/turf';
import * as Cluster from 'cluster';
import { Clusters } from '@/map/clusters';

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
  return feature<Point>(p.geometry as Point);
});

const collection = featureCollection<Point>(features);

L.Icon.Default.imagePath = '/leaflet/';


L.geoJSON(collection).addTo(map);


{
  // @TODO: Should mutate Features.
  // - for each cluster - save link to 1st icon in cluster or to the icon at center.
  // - write cluster info to the first icon (count, bbox)
  // - write visible=false to others cluster members
  const clusters = new Clusters();

  // @TODO: Calculate MaxDistance based on current Zoom (Pixel density)
  const maxDistance = 0.3;
  const clustered = clustersDbscan(collection, maxDistance, {
    mutate: true,
    minPoints: 2,
  });

  console.log(clustered);

  for (const feature of clustered.features) {
    clusters.add(feature);
  }

  // @TODO: Calculate points list based on cluster, and hide clustered points.
  // @TODO: Calculate bbox for each cluster.

  // @TODO: Draw clusters
  console.log(clusters.count);
}
