# IndexedDB Integration für Intraday Data

## ✅ Implementiert

Die IndexedDB-Integration für Intraday- und Portfolio-Daten ist jetzt vollständig implementiert:

### 🗄️ Neue Service-Architektur

**`sqlLitePortfolioHistory` Service**
- Separate IndexedDB: `portfolio-history`
- 3 Stores: `intradayEntries`, `portfolioIntradayData`, `portfolioHistory`
- Bulk-Operationen für Performance
- Spezialisierte Abfragen für Asset/Datum-Filter

### 🔄 Redux Integration

**Erweiterte `intradayDataSlice`**
- Neue Async Thunks für IndexedDB Load/Save
- Automatische Persistierung bei Datenänderungen
- Fallback-Logik (IndexedDB → Berechnung → Cache)

**Neue Async Thunks:**
- `loadIntradayEntriesFromDB` - Lade Intraday-Daten aus DB
- `saveIntradayEntriesToDB` - Speichere Intraday-Daten in DB
- `loadPortfolioIntradayFromDB` - Lade Portfolio-Intraday aus DB
- `savePortfolioIntradayToDB` - Speichere Portfolio-Intraday in DB

### 🎣 Verbesserte Hooks

**`useIntradayData()` & `useIntradayPortfolioData()`**
- IndexedDB-first Ansatz
- Automatisches Loading bei App-Start
- Background-Saving bei Datenänderungen
- Fallback zu Berechnung bei DB-Fehlern

## 🏃‍♂️ Datenfluss

### 1. App-Start (Hydration)
```
1. Redux lädt nur Metadaten aus localStorage
2. Hook versucht Daten aus IndexedDB zu laden
3. Falls erfolgreich → Daten in Redux State
4. Falls fehlgeschlagen → Berechnung + Speicherung in DB
```

### 2. Datenänderungen
```
1. Neue Berechnungen in Redux State
2. Automatische Hintergrund-Speicherung in IndexedDB
3. localStorage bekommt nur Cache-Keys/Metadaten
```

### 3. Performance-Optimierungen
```
- Bulk-Operationen für mehrere Einträge
- Date-Range Filtering direkt in DB
- Separate DB verhindert Konflikte
- Keine localStorage-Size-Limits mehr
```

## 🔧 Konfiguration

### localStorage (nur Metadaten)
```typescript
intradayData: {
  intradayEntriesCacheKey: string,
  intradayEntriesLastUpdated: number,
  portfolioIntradayCacheKey: string,
  portfolioIntradayLastUpdated: number,
  
  // Datenfelder sind immer leer in localStorage
  intradayEntries: [],
  portfolioIntradayData: [],
  assetDataMap: {}
}
```

### IndexedDB (alle Daten)
```typescript
// portfolio-history DB
{
  intradayEntries: IntradayPriceEntry[],
  portfolioIntradayData: PortfolioIntradayPoint[],
  portfolioHistory: PortfolioHistoryPoint[]
}
```

## 🧪 Testing

### Development Utilities
```javascript
// In Browser Console
portfolioHistoryDebug.getStats()           // DB Statistiken
portfolioHistoryDebug.testOperations()     // Basis-Tests
portfolioHistoryDebug.clearAllData()       // Alle Daten löschen
```

### Monitoring
- Alle DB-Operationen werden geloggt
- Cache-Performance wird getrackt
- Fehler werden detailliert geloggt

## 🚀 Nächste Schritte

1. **Testen** mit großen Datasets
2. **Performance** messen und optimieren
3. **Data Migration** von localStorage zu IndexedDB
4. **Portfolio History** Service für tägliche Snapshots
5. **Cleanup-Jobs** für alte Daten

## 🎯 Vorteile

- ✅ **Keine localStorage-Limits** mehr
- ✅ **Bessere Performance** mit großen Datasets
- ✅ **Saubere Trennung** von Main-DB und Portfolio-Data
- ✅ **Konsistente Architektur** wie bestehender Service
- ✅ **Automatische Persistierung** ohne manuelle Saves
- ✅ **Robuste Fehlerbehandlung** mit Fallbacks
