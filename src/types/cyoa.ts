// Simplified CYOA types for rolling functionality
export interface SimplifiedCyoa {
  rows: SimplifiedRow[];
  pointTypes: SimplifiedPointType[];
}

export interface SimplifiedPointType {
  id: string;
  name: string;
  beforeText: string;
  afterText: string;
  startingSum: number;
}

export interface SimplifiedRow {
  id: string;
  title: string;
  text?: string;
  image?: string;
  imageIsURL?: boolean;
  imageLink?: string;
  objects: SimplifiedObject[];
}

export interface SimplifiedObject {
  id: string;
  title: string;
  text?: string;
  image?: string;
  imageIsURL?: boolean;
  imageLink?: string;
  addons?: SimplifiedAddon[];
  scores?: SimplifiedScore[];
  requireds?: SimplifiedRequirement[];
}

export interface SimplifiedScore {
  id: string;
  value: string;
  beforeText?: string;
  afterText?: string;
  requireds?: SimplifiedRequirement[];
}

export interface SimplifiedRequirement {
  id?: string;
  type: string;
  reqId?: string;
  reqId1?: string;
  reqId2?: string;
  reqId3?: string;
  required?: boolean;
  beforeText?: string;
  afterText?: string;
  reqPoints?: number;
  operator?: string;
  orRequired?: Array<{ req: string }>;
}

export interface SimplifiedAddon {
  id: string;
  title: string;
  text?: string;
  image?: string;
  imageIsURL?: boolean;
  imageLink?: string;
  requireds?: SimplifiedRequirement[];
}

export interface CyoaSettings {
  selectedRows: Set<string>;
  keptItems: Array<{ item: SimplifiedObject; rowName: string }>;
}

export interface PredefinedCyoa {
  name: string;
  url: string;
  description?: string;
}

// Full CYOA interfaces for parsing (only the needed fields)
export interface FullCyoa {
  rows?: FullRow[];
  pointTypes?: FullPointType[];
}

export interface FullPointType {
  id: string;
  name: string;
  beforeText: string;
  afterText: string;
  startingSum: number;
}

export interface FullRow {
  id?: string;
  title?: string;
  titleText?: string;
  text?: string;
  image?: string;
  imageIsURL?: boolean;
  imageLink?: string;
  objects?: FullObject[];
}

export interface FullObject {
  id?: string;
  title?: string;
  text?: string;
  image?: string;
  imageIsURL?: boolean;
  imageLink?: string;
  addons?: FullAddon[];
  scores?: FullScore[];
  requireds?: FullRequirement[];
}

export interface FullScore {
  id: string;
  value: string;
  beforeText?: string;
  afterText?: string;
  requireds?: FullRequirement[];
}

export interface FullRequirement {
  id?: string;
  type?: string;
  reqId?: string;
  reqId1?: string;
  reqId2?: string;
  reqId3?: string;
  required?: boolean;
  beforeText?: string;
  afterText?: string;
  reqPoints?: number;
  operator?: string;
  orRequired?: Array<{ req: string }>;
}

export interface FullAddon {
  id?: string;
  title?: string;
  text?: string;
  image?: string;
  imageIsURL?: boolean;
  imageLink?: string;
  requireds?: FullRequirement[];
}
