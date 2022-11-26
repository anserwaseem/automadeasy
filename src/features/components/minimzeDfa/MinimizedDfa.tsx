import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CssBaseline,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  styled,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import { AnimationDurationOptions } from "../../../consts/AnimationDurationOptions";
import { PossibleTransitionValues } from "../../../consts/PossibleTransitionValues";
import { EquivalentStatesProps } from "./props/EquivalentStatesProps";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { MaxNumberOfStates } from "../../../consts/MaxNumberOfStates";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import { ToolsTransitionTableProps } from "../tools/props/TransitionTableProps";
import { ToolsTransitionTable } from "../tools/TransitionTable";
import { DataContext } from "../../../components/Editor";
import { GetBackgroundColor } from "../../../utils/GetBackgroundColor";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import DataArrayIcon from "@mui/icons-material/DataArray";
import { MinimizedDfaProps } from "./props/MinimizedDfaProps";
import { ToolsPlayground } from "../tools/Playground";
import { ToolsPlaygroundProps } from "../tools/props/PlaygroundProps";
import { DraggableStateModel, TransitionModel } from "../../../models";

const drawerWidth = 200;
const columnNames = PossibleTransitionValues.filter((value) => value !== "^");
let columnIndex = 0;
let numberOfTicks = 0;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: number;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),

  ...(open === 0 && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }),
  marginLeft: `-${drawerWidth}px`,

  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
  ...(open === 1 && {
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: number;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
  top: "auto",
  backgroundColor: "rgba(148, 148, 148, 0.15)",
  position: "absolute",

  ...(open === 0 && {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }),
  ...(open === 1 && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

export const MinimizedDfa = (props: MinimizedDfaProps) => {
  console.log("re rendering MinimizedDfa, props: ", props);

  const dataContext = useContext(DataContext);

  const [duration, setDuration] = useState(AnimationDurationOptions[4]);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isComplete, setIsComplete] = useState(false); // set to true when data is completely displayed
  const [isReady, setIsReady] = useState(false); // set to true when animation is completed and user clicks on "Complete" button i.e., when user is ready to move on to next step

  const [minimizedDfaStates, setMinimizedDfaStates] = useState<
    DraggableStateModel[]
  >([]);
  const [minimizedDfaTransitions, setMinimizedDfaTransitions] = useState<
    TransitionModel[]
  >([]);

  // 0 for showing explanation of showing original transition table and original DFA,
  // 1 for removing all transitions from DFA,
  // 2 for showing its explanation,
  // 3 for MergeStep,
  // 4 for TransitionStep,
  const [displayStep, setDisplayStep] = useState<number>(0);

  const [mergeStep, setMergeStep] = useState<boolean>(false);
  const [transitionStep, setTransitionStep] = useState<boolean>(false);

  // false for highlighting rows in original transition table and in equivalent states table,
  // true for showing its explanation
  const [lowerTriangularStep, setLowerTriangularStep] =
    useState<boolean>(false);
  const [statesToHighlight, setStatesToHighlight] = useState<string[]>([]);
  const [columnName, setColumnName] = useState<string>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // cells which would remain empty for current iteration
  const [emptyCells, setEmptyCells] = useState<string[][]>([]);
  const [iteration, setIteration] = useState<number>(0);
  const [isIterationComplete, setIsIterationComplete] =
    useState<boolean>(false);
  const [emptyCellsOfPreviousIteration, setEmptyCellsOfPreviousIteration] =
    useState<string[][]>([]);

  const theme = useTheme();
  const [open, setOpen] = useState(1);

  const handleTableOpen = () => {
    setOpen(1);
  };

  const handleTableClose = () => {
    setOpen(0);
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  useEffect(() => {
    setMinimizedDfaStates(props?.states);
    setMinimizedDfaTransitions(props?.transitions);
  }, []);

  useEffect(() => {
    console.log(
      "EquivalentStates useEffect, isPlaying, duration: ",
      isPlaying,
      duration
    );
    if (isPlaying) {
      let timer = setTimeout(() => {
        console.log("inside set timeout");

        handleUpdateData();

        if (mergeStep && transitionStep) {
          setIsComplete(true);
          setIsPlaying(false);
        }
      }, duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, displayStep, mergeStep, transitionStep]);

  const handleUpdateData = () => {
    console.log("MinimizedDfa handleUpdateData: stepNumber: ", displayStep);
    if (displayStep === 0) {
      setSnackbarMessage(
        "This is the original transition table and the original DFA."
      );
      setOpenSnackbar(true);
      setDisplayStep(1);
    } else if (displayStep === 1) {
      setMinimizedDfaTransitions([]);
      setDisplayStep(2);
    } else if (displayStep === 2) {
      setSnackbarMessage("All transitions of the original DFA are removed.");
      setOpenSnackbar(true);
      setDisplayStep(3);
    } else if (displayStep === 3) {
      setMergeStep(true);
    } else {
      setTransitionStep(true);
    }
  };

  const getStatesToBeHighlighted = (rows: any[]) => {
    console.log("getStatesToBeHighlighted");
    const stateNames = dataContext.rows.map((row) => row.state);

    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < stateNames.length; j++) {
        console.log(
          "getStatesToBeHighlighted rows[i][`cell-${stateNames[j]}`]: ",
          emptyCells,
          rows[i][`cell-${stateNames[j]}`]
        );
        if (
          i < j &&
          rows[i][`cell-${stateNames[j]}`] === "" &&
          !emptyCells?.some((cell) =>
            cell?.every((c) => c === stateNames[i] || c === stateNames[j])
          )
        ) {
          return [stateNames[i], stateNames[j]];
        }
      }
    }
  };

  function getExplanation(result: string) {
    if (
      statesToHighlight.length > 0 &&
      lowerTriangularStep &&
      columnName !== null
    ) {
      console.log("getExplanation statesToHighlight: ", statesToHighlight);
      const [state1, state2] = statesToHighlight;
      const state1ToCheck = dataContext.rows.find(
        (row) => row.state === state1
      )[columnName];
      const state2ToCheck = dataContext.rows.find(
        (row) => row.state === state2
      )[columnName];

      return (
        "As " +
        state1ToCheck +
        " " +
        state2ToCheck +
        " cell is " +
        (result === ""
          ? "Empty"
          : result === "✓"
          ? "Tick"
          : result === "✕"
          ? "Cross"
          : result) +
        "." +
        result
      );
    }
    return "";
  }

  const handleDurationChange = (event: SelectChangeEvent) => {
    console.log(
      "EquivalentStates handleDurationChange, event.target.value, duration: ",
      event.target.value,
      duration
    );
    setDuration(Number(event.target.value));
  };

  const handleAnimation = () => {
    console.log("MinimizedDfa handleAnimation");
    if (isComplete) {
      // if animation is complete, reset everything i.e., replay
      setIsReady(false);
      setIsComplete(false);
      setIsPlaying(true);

      setDisplayStep(0);
      setLowerTriangularStep(false);
      setStatesToHighlight([]);
      setIteration(0);
      setIsIterationComplete(false);
    } else setIsPlaying((v) => !v);
  };

  const showNextStep = () => {
    console.log("MinimizedDfa showNextStep");
    if (isComplete) {
      setIsReady(true);
      props.setIsMinimizedDfaComplete(true);
    }

    handleUpdateData();

    // stop if every cell is filled
    if (1) {
      setIsComplete(true);
      setIsPlaying(false);
    }
  };

  const transitionTableProps: ToolsTransitionTableProps = {
    rows: dataContext.rows.map((row) => {
      return {
        ...row,
        ...Object.fromEntries(
          PossibleTransitionValues.concat("state").map((key) => [
            key === "^" ? "nul" : key,
            row[key === "^" ? "nul" : key]
              .toString()
              .split(" ")
              .filter((key) => key !== "")
              .map((tv) => tv.replace("est", ""))
              .join(" ") ?? row[key === "^" ? "nul" : key],
          ])
        ),
      };
    }),

    columns: dataContext.columns
      .filter((col) => col.field !== "action" && col.field !== "nul")
      .map((col) => {
        return {
          ...col,
          editable: false,
        };
      }),

    statesToHighlight: statesToHighlight,
    columnName: columnName,
  };

  const playgroundProps: ToolsPlaygroundProps = {
    states: minimizedDfaStates,
    transitions: minimizedDfaTransitions,
    canvasWidth: "150%",
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Snackbar
          open={openSnackbar}
          autoHideDuration={
            isPlaying ? duration * 1000 : duration * 1000 * 1000
          }
          onClose={handleSnackbarClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="info"
            sx={{ width: "100%" }}
            icon={
              snackbarMessage?.at(-1) === "✓" ? (
                <CheckIcon fontSize="medium" />
              ) : snackbarMessage?.at(-1) === "✕" ? (
                <ClearIcon fontSize="medium" />
              ) : snackbarMessage?.at(-1) === "—" ? (
                <HorizontalRuleIcon fontSize="medium" />
              ) : (
                <DataArrayIcon fontSize="medium" />
              )
            }
          >
            {snackbarMessage.slice(0, -1)}
          </Alert>
        </Snackbar>
        {isIterationComplete && (
          <Snackbar
            open={openSnackbar}
            autoHideDuration={
              isPlaying ? duration * 1000 : duration * 1000 * 1000
            }
            onClose={handleSnackbarClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            <Alert onClose={handleSnackbarClose} sx={{ width: "100%" }}>
              {`Iteration ${iteration} completed.`}
            </Alert>
          </Snackbar>
        )}

        <AppBar open={open}>
          <Toolbar>
            <Grid container>
              <Grid item xs={5}>
                <IconButton
                  color="secondary"
                  aria-label="open transition table"
                  onClick={handleTableOpen}
                  // edge="start"
                  sx={{ ml: -1, ...(open === 1 && { mr: 2, display: "none" }) }}
                >
                  <TableChartOutlinedIcon />
                </IconButton>
              </Grid>
              <Grid item xs={7}>
                <Typography
                  noWrap
                  variant="h5"
                  fontWeight={"bold"}
                  color={"black"}
                  sx={{
                    ...(open === 0 && { mt: 0.5 }),
                  }}
                >
                  Minimized DFA
                </Typography>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              position: "relative",
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: "#f5f5f5",
            },
          }}
          variant="persistent"
          anchor="left"
          open={open === 1}
        >
          <DrawerHeader
            sx={{
              justifyContent: "flex-end",
              backgroundColor: "rgba(148, 148, 148, 0.15)",
              boxShadow:
                "0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)",
            }}
          >
            <Typography
              noWrap
              variant="overline"
              align="center"
              fontWeight={"bold"}
            >
              Transition Table
            </Typography>
            <IconButton onClick={handleTableClose}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <Box
            sx={{
              marginTop: "40%",
            }}
          >
            <ToolsTransitionTable {...transitionTableProps} />
          </Box>
        </Drawer>

        <Main open={open} sx={{ paddingBottom: 12 }}>
          <DrawerHeader />
          <Grid container>
            {/* Grid for Add a Row button and Tools */}
            <Grid item alignItems={"center"} xs={12}>
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
                  onClick={showNextStep}
                  disabled={isReady}
                >
                  {isComplete ? "Complete" : "Next"}
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={12}>
              <Grid item xs={12} md={8}>
                <ToolsPlayground {...playgroundProps} />
              </Grid>
            </Grid>
          </Grid>
        </Main>
      </Box>
    </>
  );
};