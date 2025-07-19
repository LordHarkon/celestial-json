export type Header = {
  _id: string;
  name: string;
  order: number;
};

export type Sheet = {
  name: string;
  headers: Header[];
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

export type ComparisonType = "lt" | "lte" | "eq" | "gt" | "gte";

export type HeaderConfig = {
  name: string;
  type?: HeaderType;
  value?: string | number;
  inverse?: boolean;
  comparison?: ComparisonType;
};

export type RollConfig = {
  selectedSheets: Set<string>;
  headers: HeaderConfig[];
};

export type HeaderChange = {
  id: string;
  from: string;
  to: string;
  timestamp: number;
};

export type Settings = {
  mappings: Record<string, { to: string; order: number }>;
  hiddenHeaders: string[];
  headerChanges: HeaderChange[];
};
