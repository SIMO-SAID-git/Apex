import type { FacilityZone, TrafficStats } from "@/types/facility";

export const mockFacilityZones: FacilityZone[] = [
  {
    id: "zone-iron",
    name: "Heavy Iron Pit",
    description: "Competition platforms, calibrated plates, and dedicated spotter stations for maximal strength work.",
    equipment: ["Eleiko competition platforms", "Eleiko racks", "Hammer Strength plate-loaded rigs", "Deadlift bars"],
    featureTags: ["Eleiko Racks", "Hammer Strength", "Chalk Stations"],
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=600&fit=crop",
    ],
    operatingHours: "05:00 – 23:00 daily",
    points: "60,60 340,60 340,320 60,320",
    labelX: 200,
    labelY: 190,
  },
  {
    id: "zone-cardio",
    name: "Cardio Deck",
    description: "Elevated deck overlooking the floor with rowers, bikes, and treadmills synced to class programming.",
    equipment: ["Concept2 rowers", "Assault bikes", "Woodway treadmills", "SkiErg stations"],
    featureTags: ["Heart-Rate Sync", "City Views", "Woodway Treadmills"],
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&h=600&fit=crop",
    ],
    operatingHours: "05:00 – 23:00 daily",
    points: "380,60 660,60 660,240 380,240",
    labelX: 520,
    labelY: 150,
  },
  {
    id: "zone-plunge",
    name: "Cold Plunge Suite",
    description: "Temperature-controlled plunge pools and sauna paired for contrast therapy protocols.",
    equipment: ["Cold plunge pools (3–7°C)", "Infrared sauna", "Recovery lounge seating"],
    featureTags: ["Temperature-Controlled", "Infrared Sauna", "Towel Service"],
    images: [
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&h=600&fit=crop",
    ],
    operatingHours: "06:00 – 22:00 daily",
    points: "380,280 660,280 660,440 380,440",
    labelX: 520,
    labelY: 360,
  },
  {
    id: "zone-functional",
    name: "Functional Training",
    description: "Open turf and rig space for sleds, kettlebells, and mixed-modal conditioning work.",
    equipment: ["Prowler sleds", "Kettlebell wall", "Battle ropes", "Plyo boxes", "Rig with rings & bands"],
    featureTags: ["Turf Zone", "Sled Track", "Open Rig"],
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517964603305-4f8b8b6b3f2c?w=800&h=600&fit=crop",
    ],
    operatingHours: "05:00 – 23:00 daily",
    points: "60,360 340,360 340,560 60,560",
    labelX: 200,
    labelY: 460,
  },
  {
    id: "zone-boxing",
    name: "Boxing Area",
    description: "Heavy bags, speed bags, and a sprung floor ring for technique and conditioning classes.",
    equipment: ["Heavy bags", "Speed bags", "Sprung-floor ring", "Focus mitts"],
    featureTags: ["Sprung Floor", "Ring", "Wrap Storage"],
    images: [
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517438322307-e67111335449?w=800&h=600&fit=crop",
    ],
    operatingHours: "06:00 – 22:00 daily",
    points: "380,480 660,480 660,600 500,640 380,600",
    labelX: 520,
    labelY: 550,
  },
  {
    id: "zone-recovery",
    name: "Recovery Zone",
    description: "Mats, mobility tools, and a quiet room for guided breathwork and zen classes.",
    equipment: ["Foam rollers", "Resistance bands", "Massage guns", "Yoga mats & blocks"],
    featureTags: ["Quiet Hours", "Guided Sessions", "Mobility Tools"],
    images: [
      "https://images.unsplash.com/photo-1591741535018-d042766c62eb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop",
    ],
    operatingHours: "05:00 – 23:00 daily",
    points: "60,400 340,600 60,600",
    labelX: 150,
    labelY: 550,
  },
];

function generateHourly(peakHour: number, baseline: number): TrafficStats["hourly"] {
  return Array.from({ length: 24 }, (_, hour) => {
    const distance = Math.min(Math.abs(hour - peakHour), 24 - Math.abs(hour - peakHour));
    const level = Math.max(5, Math.round(baseline + (100 - baseline) * Math.exp(-(distance ** 2) / 8)));
    return { hour, level: Math.min(100, level) };
  });
}

export const mockTrafficStats: TrafficStats[] = [
  { zoneId: "zone-iron", peakHour: 18, currentLevel: 62, hourly: generateHourly(18, 15) },
  { zoneId: "zone-cardio", peakHour: 7, currentLevel: 40, hourly: generateHourly(7, 10) },
  { zoneId: "zone-plunge", peakHour: 19, currentLevel: 30, hourly: generateHourly(19, 8) },
  { zoneId: "zone-functional", peakHour: 17, currentLevel: 71, hourly: generateHourly(17, 12) },
  { zoneId: "zone-boxing", peakHour: 18, currentLevel: 55, hourly: generateHourly(18, 10) },
  { zoneId: "zone-recovery", peakHour: 20, currentLevel: 25, hourly: generateHourly(20, 6) },
];
