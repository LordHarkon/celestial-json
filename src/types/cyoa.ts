// Simplified CYOA types for rolling functionality
export interface SimplifiedCyoa {
  rows: SimplifiedRow[];
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
}

export interface SimplifiedAddon {
  id: string;
  title: string;
  text?: string;
  image?: string;
  imageIsURL?: boolean;
  imageLink?: string;
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
}

export interface FullAddon {
  id?: string;
  title?: string;
  text?: string;
  image?: string;
  imageIsURL?: boolean;
  imageLink?: string;
}
