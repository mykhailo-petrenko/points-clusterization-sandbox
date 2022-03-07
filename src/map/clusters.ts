import { Feature, featureCollection, FeatureCollection, point, Point, Position } from '@turf/turf';
import { DbscanProps } from '@turf/clusters-dbscan';

export interface Cluster {
  id: number;
  points: Feature<Point>[];
  count: number;
  bbox: number[];
}

export interface ClusterFeatureProperties {
  id: number;
  count: number;
  bbox: number[];
}

export class Clusters {
  readonly clusters: {[clusterId: number]: Cluster};
  public count: number;

  constructor() {
    this.clusters = {};
    this.count = 0;
  }

  public add(feature: Feature<Point, DbscanProps>) {
    const clusterId = feature.properties.cluster;

    if (!this.hasCluster(clusterId)) {
      this.initCluster(clusterId);
      this.count++;
    }

    const cluster = this.getCluster(clusterId);
    this.addClusterMember(cluster, feature);
  }

  public hasCluster(clusterId: number): boolean {
    return (this.clusters[clusterId] !== undefined && this.clusters[clusterId].count !== 0);
  }

  public getCluster(clusterId: number): Cluster {
    return this.clusters[clusterId];
  }

  public getClustersCollection(): FeatureCollection<Point, ClusterFeatureProperties> {
    let points = [];
    for (const clusterId in this.clusters) {
      points.push(this.clusterAsFeature(this.clusters[clusterId]))
    }

    return featureCollection<Point, ClusterFeatureProperties>(points);
  }

  private clusterAsFeature(cluster: Cluster): Feature<Point, ClusterFeatureProperties> {
    const coord: Position = [
      (cluster.bbox[0] + cluster.bbox[1]) / 2,
      (cluster.bbox[1] + cluster.bbox[2]) / 2,
    ];

    return point<ClusterFeatureProperties>(
      coord,
      {
        bbox: cluster.bbox,
        count: cluster.count,
        id: cluster.id
      } as ClusterFeatureProperties
    );
  }

  private addClusterMember(cluster: Cluster, feature: Feature<Point>) {
    cluster.count++;
    cluster.points.push(feature);

    const [x, y] = feature.geometry.coordinates;

    cluster.bbox[0] = Math.min(x, cluster.bbox[0]);
    cluster.bbox[1] = Math.min(y, cluster.bbox[1]);
    cluster.bbox[2] = Math.max(x, cluster.bbox[2]);
    cluster.bbox[3] = Math.max(y, cluster.bbox[3]);
  }

  private initCluster(clusterId: number): void {
    this.clusters[clusterId] = {
      id: clusterId,
      points: [],
      count: 0,
      bbox: [Infinity, Infinity, -Infinity, -Infinity],
    };
  }
}
