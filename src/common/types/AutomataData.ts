import { GridColumns } from "@mui/x-data-grid";
import { RowModel, DraggableStateModel, TransitionModel } from "../../models";
import { PlaygroundSize } from "./PlaygroundSize";

export type AutomataData = {
  [x: string]: any;
  rowId: number;
  setRowId: React.Dispatch<React.SetStateAction<number>>;
  rows: RowModel[];
  setRows: React.Dispatch<React.SetStateAction<RowModel[]>>;
  states: DraggableStateModel[];
  setStates: React.Dispatch<React.SetStateAction<DraggableStateModel[]>>;
  transitions: TransitionModel[];
  setTransitions: React.Dispatch<React.SetStateAction<TransitionModel[]>>;
  columns: GridColumns;
  playgroundSize: PlaygroundSize;
  stateSize: number;
  setStateSize: React.Dispatch<React.SetStateAction<number>>;
  nullClosureRows: RowModel[];
  setNullClosureRows: React.Dispatch<React.SetStateAction<RowModel[]>>;
  modifiedTableRows: RowModel[];
  setModifiedTableRows: React.Dispatch<React.SetStateAction<RowModel[]>>;
};
