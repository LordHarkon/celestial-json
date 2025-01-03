export type Sheet = {
  name: string;
  headers: string[];
  data: Record<string, unknown>[];
  renamedHeaders?: Record<string, string>;
};

export type ExcelFile = {
  sheets: Sheet[];
};
