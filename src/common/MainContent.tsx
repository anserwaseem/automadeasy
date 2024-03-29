import { styled } from "@mui/material";

export const MainContent = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})<{
  open?: number;
}>(({ theme, open }) => ({
  flexGrow: 1,
  overflow: "hidden",
  padding: theme.spacing(1),

  ...(open === 0 && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }),

  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
  ...(open === 1 && {
    marginLeft: 0,
  }),
  ...(open === 2 && {
    marginRight: 0,
  }),
}));
