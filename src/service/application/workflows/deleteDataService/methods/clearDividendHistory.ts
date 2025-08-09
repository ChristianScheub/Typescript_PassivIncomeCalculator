import sqliteService from "@/service/infrastructure/sqlLiteService";
import Logger from "@/service/shared/logging/Logger/logger";

export const clearDividendHistory = async () => {
  try {
    Logger.infoService(
      "Starte das Löschen des Dividendenverlaufs aller AssetDefinitions"
    );
    const assetDefs = await sqliteService.getAll("assetDefinitions");
    let updatedCount = 0;
    for (const def of assetDefs) {
      let changed = false;
      if (def.dividendHistory && def.dividendHistory.length > 0) {
        def.dividendHistory = [];
        changed = true;
      }
      if (def.dividendGrowthPast3Y !== undefined) {
        def.dividendGrowthPast3Y = undefined;
        changed = true;
      }
      if (def.dividendForecast3Y && def.dividendForecast3Y.length > 0) {
        def.dividendForecast3Y = undefined;
        changed = true;
      }
      if (changed && def.id) {
        await sqliteService.update("assetDefinitions", def);
        updatedCount++;
      }
    }
    Logger.infoService(
      `Dividendenverlauf bei ${updatedCount} Assets gelöscht.`
    );
  } catch (error) {
    Logger.error(
      "Fehler beim Löschen des Dividendenverlaufs: " + JSON.stringify(error)
    );
    throw error;
  }
};
