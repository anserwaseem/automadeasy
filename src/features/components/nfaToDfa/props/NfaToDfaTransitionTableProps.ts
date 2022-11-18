import { GridColumns } from "@mui/x-data-grid";
import { RowModel } from "../../../../models";

export type NfaToDfaTransitionTableProps = {
  rows: RowModel[];
  setRows: React.Dispatch<React.SetStateAction<RowModel[]>>;
  columns: GridColumns;
  rowId: number;
  setRowId: React.Dispatch<React.SetStateAction<number>>;
};