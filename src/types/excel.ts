export type Sheet = {
  name: string;
  headers: string[];
  data: Record<string, unknown>[];
};

export type ExcelFile = {
  sheets: Sheet[];
};

export type JsonData = {
  sheetName: string;
  data: Record<string, string | number | null>[];
}[];

export type HeaderType = "index" | "price" | "text";

export type HeaderConfig = {
  name: string;
  type?: HeaderType;
  value?: string | number;
};

export type RollConfig = {
  selectedSheets: Set<string>;
  headers: HeaderConfig[];
};

export type Settings = {
  mappings: Record<string, string>;
  hiddenHeaders: string[];
};
