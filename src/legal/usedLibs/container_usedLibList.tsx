import React, { useState } from "react";
import UsedLibListScreen from "./screen_usedLibList";
import { useTranslation } from "react-i18next";
import licensesData from "./licenses.json";

interface LicenseInfo {
    licenses: string;
    repository: string;
    publisher?: string;
    url?: string;
    path: string;
    licenseFile: string;
  }
  
  interface LicensesObject {
    [packageName: string]: LicenseInfo;
  }
  
  interface NpmModule {
    name: string;
    version: string;
    licenses: string;
    repository: string;
  }
  

const UsedLibsListContainer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const npmModules: NpmModule[] = Object.entries(licensesData as unknown as LicensesObject).map(([key, value]) => {
    const [name, version] = key.split('@');
    return {
      name,
      version: version,
      licenses: value.licenses,
      repository: value.repository
    };
  });



  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <p onClick={handleClickOpen} data-testid="usedLib_Open_Btn">
        {t("setting_Menu_OpenSourceModulList")}
      </p>
      <UsedLibListScreen
        open={open}
        handleClose={handleClose}
        npmModules={npmModules}
      />
    </div>
  );
};

export default UsedLibsListContainer;