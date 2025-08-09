import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

interface NpmModule {
  name: string;
  version: string;
  licenses: string;
  repository: string;
}

interface UsedLibListScreenProps {
  open: boolean;
  handleClose: () => void;
  npmModules: NpmModule[];
}

const UsedLibListScreen: React.FC<UsedLibListScreenProps> = ({
  open,
  handleClose,
  npmModules,
}) => {
  const { t } = useTranslation();
  const handleModuleClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll="paper"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle data-testid="setting_OpenSurceModulListTItle">{t("setting_OpenSurceModulListTItle")}</DialogTitle>
        <DialogContent dividers>
          <List data-testid="used-lib-list-modal">
            {npmModules.map((module, index) => (
              <ListItem
                key={module.name+module.version+index}
                onClick={() => handleModuleClick(module.repository)}
              >
                <ListItemText
                  primary={`${module.name}@${module.version}`}
                  secondary={`License: ${module.licenses}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} data-testid="close-btn-lib-list-modal">
            {t("setting_OpenSourceModulListClose")}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default UsedLibListScreen;