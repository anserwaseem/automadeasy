import { DraggableStateModel } from "../../../../models";
import { SelectedElementType } from "../../../props/SelectedElementType";

export type EditableLabelProps = {
  transitionValue: string;
  setTransitionValue: React.Dispatch<React.SetStateAction<string>>;
  oldTransitionValue: string;
  setOldTransitionValue: React.Dispatch<React.SetStateAction<string>>;
  box: DraggableStateModel;
  selected: SelectedElementType | null;
};
