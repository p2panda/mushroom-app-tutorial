export type Mushroom = {
  title: string;
  description: string;
  latin: string;
  edible: boolean;
};

export type Picture = {
  blob: string;
  lat: number;
  lon: number;
  mushrooms: string[];
};
