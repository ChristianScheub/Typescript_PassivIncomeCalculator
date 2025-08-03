const featureFlag_Debug_View: boolean = false; //Show some dev things in the view
const featureFlag_Debug_Settings_View: boolean = false; //Show dev settings things in the view

const featureFlag_Debug_StoreLogs: boolean = false; //Store logs in the local storage

const featureFlag_SetupWizzard: boolean = true; //Enable setup wizard feature
const featureFlag_Debug_AllLogs: boolean = false; //Show all logs in the console
const featureFlag_Debug_Log_infoRedux: boolean = false; //Show info logs of the setter in the console
const featureFlag_Debug_Log_Service: boolean = false; //Show info logs of the setter in the console
const featureFlag_Debug_Log_Info: boolean = false; //Show info logs in the console
const featureFlag_Debug_Log_Warning: boolean = true; //Show warning logs in the console
const featureFlag_Debug_Log_Error: boolean = false; //Show error logs in the console
const featureFlag_Debug_Log_Analytics: boolean = false; //Show analytics logs in the console
const featureFlag_Debug_Log_Cache: boolean = false; //Show cache logs in the console
const featureFlag_Debug_Log_API: boolean = true; //Show API service logs in the console
const featureFlag_SetupImport: boolean = false; //Enable setup import feature

const developerPasswordHash: string = "3f3f61d0e6c8f1b6fba7cb59c669fa342a3e02b92fcf80cf2233e3ee3771f98c"; // SHA256 hash of "hello"

export {
  developerPasswordHash,
  featureFlag_SetupWizzard,
  featureFlag_Debug_Log_Analytics,
  featureFlag_Debug_Settings_View,
  featureFlag_Debug_View,
  featureFlag_Debug_StoreLogs,
  featureFlag_Debug_Log_Service,
  featureFlag_Debug_AllLogs,
  featureFlag_Debug_Log_infoRedux,
  featureFlag_Debug_Log_Error,
  featureFlag_Debug_Log_Warning,
  featureFlag_Debug_Log_Info,
  featureFlag_Debug_Log_Cache,
  featureFlag_Debug_Log_API,
  featureFlag_SetupImport
};