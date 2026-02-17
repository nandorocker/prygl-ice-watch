
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface IceStatusReport {
  summary: string;
  canSkate: 'YES' | 'NO' | 'UNSURE';
  iceThickness?: string;
  lastUpdated: string;
  sources: GroundingSource[];
  warnings: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
