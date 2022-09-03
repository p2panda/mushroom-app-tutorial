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

export type NextArgs = {
  logId: string;
  seqNum: string;
  backlink?: string;
  skiplink?: string;
};

export type Meta = {
  viewId: string;
  documentId: string;
};

export type MushroomResponse = {
  meta: Meta;
  fields: Mushroom;
};

export type PictureResponse = {
  meta: Meta;
  fields: {
    blob: string;
    lat: number;
    lon: number;
    mushrooms: MushroomResponse[];
  };
};
