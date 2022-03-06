import { Feature, Point } from '@turf/turf';
import { DbscanProps } from '@turf/clusters-dbscan';

export interface Cluster {
  id: number;
  points: Feature<Point>[];
  count: number;
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

    cluster.count++;
    cluster.points.push(feature);
  }

  public hasCluster(clusterId: number): boolean {
    return (this.clusters[clusterId] !== undefined && this.clusters[clusterId].count !== 0);
  }

  public clusterMembersCount(clusterId: number): number {
    if (!this.hasCluster(clusterId)) {
      return 0;
    }

    return this.clusters[clusterId].count;
  }

  public getCluster(clusterId: number): Cluster {
    return this.clusters[clusterId];
  }

  private initCluster(clusterId: number): void {
    this.clusters[clusterId] = {
      id: clusterId,
      points: [],
      count: 0,
    };
  }
}
