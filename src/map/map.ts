import 'leaflet/dist/leaflet.css';
import L, {latLng, latLngBounds, LatLngTuple, Layer} from 'leaflet';

import {MOCK_RESPONSE} from './mock_response';
import {clustersDbscan, Feature, feature, featureCollection, GeometryObject, Point} from '@turf/turf';
import {ClusterFeatureProperties, Clusters} from '@/map/clusters';
import {DbscanProps} from '@turf/clusters-dbscan';

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

const clusterIcon = L.icon({
  iconUrl: '/leaflet/cluster-icon.png',
  iconRetinaUrl: '/leaflet/cluster-icon-2x.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [-3, -3],
  shadowUrl: null,
});

const iconOption = {icon: clusterIcon};


let _pointsLayer = null;

{
  const CLUSTER_MAX_ZOOM = 17;
  const Geo = {
    tile_size: 256,
    half_circumference_meters: 20037508.342789244,
    circumference_meters: 20037508.342789244 * 2,
    min_zoom_meters_per_pixel: 0,
  };

  Geo.min_zoom_meters_per_pixel = Geo.circumference_meters / Geo.tile_size;

  const metersPerPixel = (z) => Geo.min_zoom_meters_per_pixel / Math.pow(2, z);

  let _clustersLayer = null;

  const clusterize = () => {
    if (_clustersLayer) {
      _clustersLayer.removeFrom(map);
    }

    if (_pointsLayer) {
      _pointsLayer.removeFrom(map);
    }

    for (const f of collection.features) {
      delete f.properties.dbscan;
      delete f.properties.cluster;
    }

    const zoom = map.getZoom();
    // @TODO: Should mutate Features.
    // - for each cluster - save link to 1st icon in cluster or to the icon at center.
    // - write cluster info to the first icon (count, bbox)
    // - write visible=false to others cluster members
    const clusters = new Clusters();


    if (zoom <= CLUSTER_MAX_ZOOM) {
      // @TODO: Calculate MaxDistance based on current Zoom (Pixel density)
      const maxDistance = (metersPerPixel(zoom) * 15) / 1000;
      const clustered = clustersDbscan(collection, maxDistance, {
        mutate: true,
        minPoints: 3,
      });

      for (const feature of clustered.features) {
        clusters.add(feature);
      }

      // @TODO: Calculate points list based on cluster, and hide clustered points.
      // @TODO: Calculate bbox for each cluster.


      const clusterCollection = clusters.getClustersCollection();

      _clustersLayer = L.geoJSON(clusterCollection, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, iconOption);
        },
        onEachFeature(feature: Feature<GeometryObject, ClusterFeatureProperties>, layer: Layer) {
          layer.on('click', (e) => {
            console.log(e, feature.properties.bbox);
            const bbox = feature.properties.bbox;

            map.flyToBounds([
              [bbox[1], bbox[0]],
              [bbox[3], bbox[2]],
            ], {duration: 0.3})
          })
        }
      });

      _clustersLayer.addTo(map);
    }

    _pointsLayer = L.geoJSON(collection, {
      filter(geoJsonFeature: Feature<GeometryObject, DbscanProps>): boolean {
        return (
          geoJsonFeature.properties.cluster === undefined ||
          geoJsonFeature.properties.dbscan === 'noise'
        );
      }
    })

    _pointsLayer.addTo(map);
  }

  clusterize();

  map.on('moveend', () => {
    clusterize();
  });
}

