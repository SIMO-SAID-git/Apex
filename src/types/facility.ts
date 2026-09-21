export interface FacilityZone {
  id: string;
  name: string;
  description: string;
  equipment: string[];
  featureTags: string[];
  images: string[];
  operatingHours: string;
  /** SVG polygon points for the blueprint map, in a 0-1000 viewBox */
  points: string;
  labelX: number;
  labelY: number;
}

export interface HourlyTraffic {
  hour: number; // 0-23
  level: number; // 0-100
}

export interface TrafficStats {
  zoneId: string;
  hourly: HourlyTraffic[];
  currentLevel: number;
  peakHour: number;
}
