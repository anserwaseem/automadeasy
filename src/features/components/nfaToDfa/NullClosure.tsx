import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { GridColumns, GridActionsCellItem } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { AnimationDurationOptions } from "../../../consts/AnimationDurationOptions";
import { MaxNumberOfStates } from "../../../consts/MaxNumberOfStates";
import {
  RowModel,
  DraggableStateModel,
  TransitionModel,
} from "../../../models";
import { ModifiedTable } from "./ModifiedTable";
import { NfaToDfaPlayground } from "./Playground";
import { ModifiedTableProps } from "./props/ModifiedTable";
import { NullClosureProps } from "./props/NullClosureProps";
import { NfaToDfaPlaygroundProps } from "./props/PlaygroundProps";
import { NfaToDfaTransitionTableProps } from "./props/TransitionTableProps";
import { NfaToDfaTransitionTable } from "./TransitionTable";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { PossibleTransitionValues } from "../../../consts/PossibleTransitionValues";

const numberOfColumns = 2; // one for state and one for null
let index = numberOfColumns;

export const NullClosure = (props: NullClosureProps) => {
  console.log("re-rendering null closure, props: ", props);
  const [duration, setDuration] = useState(AnimationDurationOptions[3]);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isComplete, setIsComplete] = useState(false); // set to true when data is completely displayed
  const [isReady, setIsReady] = useState(false); // set to true when animation is completed and user clicks on "Complete" button i.e., when user is ready to move on to next step

  const [nullClosureRowId, setNullClosureRowId] = useState(0); // TODO why is this needed?
  const [nullClosureRows, setNullClosureRows] = useState<RowModel[]>([]);
  const columns: GridColumns = [
    { field: "id", hide: true, hideable: false },
    {
      field: "state",
      headerName: "State",
      disableColumnMenu: true,
      sortable: false,
      flex: 1,
    },
    {
      field: "nul",
      headerName: "null",
      disableColumnMenu: true,
      sortable: false,
      flex: 2,
    },
  ];
  const [nullClosureStates, setNullClosureStates] = useState<
    DraggableStateModel[]
  >([]);
  const [nullClosureTransitions, setNullClosureTransitions] = useState<
    TransitionModel[]
  >([]);

  // populate props rows in null closure table one by one with null closure states and transitions according to specified duration and isPlaying
  useEffect(() => {
    console.log(
      "null closure useEffect, isPlaying, duration: ",
      isPlaying,
      duration
    );
    if (isPlaying) {
      let timer = setTimeout(() => {
        console.log("inside set timeout, index", index);
        const rowIndex = Math.floor(index / numberOfColumns);
        console.log(
          "before handleUpdateData: index, rowIndex: ",
          index,
          rowIndex,
          props.rows.length
        );

        handleUpdateData(
          rowIndex,
          props.rows.slice(0, rowIndex),
          props.states.slice(0, rowIndex),
          props.transitions
        );

        // stop if all rows have been displayed i.e., if rowIndex equals rows length and last row's null column has been displayed
        if (rowIndex === props.rows.length && index % numberOfColumns !== 0) {
          setIsComplete(true);
          setIsPlaying(false);
        } else index++;
      }, duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [props, nullClosureRows, isPlaying]);

  const handleUpdateData = (
    rowIndex: number,
    rows: RowModel[],
    states: DraggableStateModel[],
    transitions: TransitionModel[]
  ) => {
    console.log(
      "handleUpdateData, rowIndex, index, rows: ",
      rowIndex,
      index,
      rows
    );
    setNullClosureRowId(rowIndex);
    // copy all null transitions for each row and paste them in the null column alongwith state name
    setNullClosureRows(
      rows.map((row, mapIndex) => {
        console.log("index, rowIndex, mapIndex: ", index, rowIndex, mapIndex);
        return {
          ...row,
          nul:
            // display null transitions for every row except the last row
            rowIndex - 1 === mapIndex && index % 2 === 0
              ? ""
              : row.state + (row.nul ? ", " : "") + row.nul,
        };
      })
    );

    setNullClosureStates(states);
    setNullClosureTransitions(
      transitions.filter(
        (transition) =>
          transition.props.value.includes("^") &&
          states.findIndex((state) => state.id === transition.props.start) !==
            -1 &&
          states.findIndex((state) => state.id === transition.props.end) !== -1
      )
    );
  };

  const handleDurationChange = (event: SelectChangeEvent) => {
    console.log(
      "NullClosure handleDurationChange, event.target.value, duration: ",
      event.target.value,
      duration
    );
    setDuration(Number(event.target.value));
  };

  const handleAnimation = () => {
    console.log("NullClosure handleAnimation");
    if (isComplete) {
      // when replay button is clicked, null clossure component is re-rendered
      // so, modified transition table AND resultant dfa are made hidden until animation is completed
      // because modified transition table and resultant dfa are dependent on null closure table
      setIsReady(false);
      setIsComplete(false);
      index = 1;
      setIsPlaying(true);
    } else setIsPlaying((v) => !v);
  };

  const showNextRow = () => {
    console.log("NullClosure show next row, index: ", index);
    const rowIndex = Math.floor(index / numberOfColumns);
    if (isComplete) setIsReady(true);
    handleUpdateData(
      rowIndex,
      props.rows.slice(0, rowIndex),
      props.states.slice(0, rowIndex),
      props.transitions
    );

    // stop if all rows have been displayed i.e., if rowIndex equals rows length and last row's null column has been displayed
    if (rowIndex === props.rows.length && index % numberOfColumns !== 0) {
      setIsComplete(true);
      setIsPlaying(false);
    } else index++;
  };

  const handleAddRow = (row: RowModel) => {
    if (nullClosureStates.length >= MaxNumberOfStates) {
      alert(`Maximum ${MaxNumberOfStates} states allowed`);
      return;
    }
    setNullClosureRows((prev) => [...prev, row]);
    setNullClosureRowId((prev) => prev + 1);
    // const newState = new DraggableStateModel(
    //   row.state,
    //   Math.floor(Math.random() * size.width),
    //   Math.floor(Math.random() * size.height)
    // );
    // setStates((prev) => [...prev, newState]);
  };

  const handleDeleteRow = (row: RowModel) => {
    console.log("handleDeleteRow", row);
    // console.log(
    //   "resultant data",
    //   rows
    //     .filter((r) => r.id !== row.id)
    //     .map((r) => {
    //       return {
    //         ...r,
    //         ...Object.fromEntries(
    //           PossibleTransitionValues.map((key) => [
    //             key === "^" ? "nul" : key,
    //             r[key === "^" ? "nul" : key].toString().includes(row.state)
    //               ? r[key === "^" ? "nul" : key]
    //                   .toString()
    //                   .replace(row.state, "")
    //               : r[key === "^" ? "nul" : key],
    //           ])
    //         ),
    //       };
    //     })
    // );

    // setRows((rows) =>
    //   rows
    //     .filter((r) => r.id !== row.id)
    //     .map((r) => {
    //       return {
    //         ...r,
    //         ...Object.fromEntries(
    //           PossibleTransitionValues.map((key) => [
    //             key === "^" ? "nul" : key,
    //             r[key === "^" ? "nul" : key].toString().includes(row.state)
    //               ? r[key === "^" ? "nul" : key]
    //                   .toString()
    //                   .replace(row.state, "")
    //               : r[key === "^" ? "nul" : key],
    //           ])
    //         ),
    //       };
    //     })
    // );

    // setTransitions((prev) =>
    //   prev.filter(
    //     (t) => t.props.start !== row.state && t.props.end !== row.state
    //   )
    // );

    // setStates((prev) => prev.filter((s) => s.id !== row.state));
  };

  const transitionTableProps: NfaToDfaTransitionTableProps = {
    rows: nullClosureRows.map((row) => {
      return {
        ...row,
        ...Object.fromEntries(
          PossibleTransitionValues.concat("state").map((key) => [
            key === "^" ? "nul" : key,
            row[key === "^" ? "nul" : key]
              .toString()
              .split(" ")
              .filter((key) => key !== "")
              .map((tv) => tv.replace("nc", ""))
              .join(" ") ?? row[key === "^" ? "nul" : key],
          ])
        ),
      };
    }),
    setRows: setNullClosureRows,
    columns: columns,
    rowId: nullClosureRowId,
    setRowId: setNullClosureRowId,
    handleAddRow: handleAddRow,
  };

  const playgroundProps: NfaToDfaPlaygroundProps = {
    states: nullClosureStates,
    setStates: setNullClosureStates,
    transitions: nullClosureTransitions,
    setTransitions: setNullClosureTransitions,
    rows: nullClosureRows,
    setRows: setNullClosureRows,
    handleDeleteRow: handleDeleteRow,
  };

  const modifiedTableProps: ModifiedTableProps = {
    rows: nullClosureRows,
    // states: nullClosureStates,
    // transitions: nullClosureTransitions,
  };

  return (
    <>
      <Box sx={{ flexGrow: 1, m: 1, mt: 5 }}>
        <Typography
          variant="h5"
          component="div"
          gutterBottom
          align="center"
          fontWeight={"bold"}
          bgcolor={"rgb(200, 200, 200)"}
        >
          Null Closure (Reachability)
        </Typography>
        {/* Grid to incorporate Transition table and Playground */}
        <Grid
          container
          columnSpacing={{
            xs: 1,
            sm: 2,
            md: 3,
          }}
        >
          {/* Transition table grid */}
          <Grid item xs={12} md={4}>
            {/* Grid for Add a Row button and Tools */}
            <Grid container item xs={12} alignItems={"center"}>
              <ButtonGroup
                disableElevation
                fullWidth
                variant="outlined"
                size="large"
              >
                <FormControl fullWidth>
                  <InputLabel id="delay-select-label">Delay</InputLabel>
                  <Select
                    labelId="delay-select-label"
                    id="delay-select"
                    value={duration.toString()}
                    label="Delay"
                    onChange={handleDurationChange}
                  >
                    {AnimationDurationOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* <Button onClick={handleAnimationPause}>Pause</Button> */}
                <Button
                  onClick={handleAnimation}
                  startIcon={
                    isPlaying ? (
                      <PauseRoundedIcon />
                    ) : isComplete ? (
                      <ReplayRoundedIcon />
                    ) : (
                      <PlayArrowRoundedIcon />
                    )
                  }
                >
                  {isPlaying ? "Pause" : isComplete ? "Replay" : "Play"}
                </Button>
                <Button
                  variant={isComplete ? "contained" : "outlined"}
                  onClick={showNextRow}
                  disabled={isReady}
                >
                  {isComplete ? "Complete" : "Next"}
                </Button>
              </ButtonGroup>
              {/* <AnimationController {...animationControllerProps} /> */}
            </Grid>
            <NfaToDfaTransitionTable {...transitionTableProps} />
          </Grid>
          {/* Playground grid */}
          <Grid item xs={12} md={8}>
            <NfaToDfaPlayground {...playgroundProps} />
          </Grid>
        </Grid>
      </Box>
      {isReady && <ModifiedTable {...modifiedTableProps} />}
    </>
  );
};