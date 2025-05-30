import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import Logger from "../Logger/logger";

export const handleFileDownload = async (logs: string) => {
  try {
    const fileName = generateFileName();
    Logger.error("File Name generated: " + fileName);
    const base64Data = btoa(logs);

    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    });
    Logger.error("File written: " + fileName);

    const uriResult = await Filesystem.getUri({
      directory: Directory.Documents,
      path: fileName,
    });

    await Share.share({
      url: uriResult.uri,
    });
  } catch (error) {
    if (logs) {
      downloadFile(logs, generateFileName());
    }
    Logger.error("Error exporting Logs:" + error);
  }
};

const downloadFile = (base64Data: string, fileName: string) => {
  const blob = new Blob([base64Data], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const generateFileName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  return `PassivIncomeCalculator-${year}${month}${day}-${hours}${minutes}${seconds}.json`;
};