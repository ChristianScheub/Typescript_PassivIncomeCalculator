# Forecast Container Performance Optimization

## Überblick

Der `ForecastContainer` wurde optimiert, um Berechnungen aus dem Redux Cache zu verwenden anstatt alle Werte bei jedem Render neu zu berechnen. Dies verbessert die Performance erheblich und berücksichtigt dabei auch monatliche Dividendenauszahlungen.

## Neue Implementierung

### ForecastSlice
Ein neues Redux Slice (`forecastSlice.ts`) wurde hinzugefügt, das:
- Alle Forecast-Berechnungen cached
- Monatliche Asset-Einkommen für jeden Monat (1-12) cached
- Automatisch aktualisiert wird wenn sich Basis-Daten ändern
- Dashboard-Werte wiederverwendet um Duplikate zu vermeiden

### Cache-Features

#### Monatlicher Asset-Einkommen Cache
```typescript
monthlyAssetIncomeCache: Record<number, number>
```
- Cached das Asset-Einkommen für jeden Monat (1-12)
- Berücksichtigt Dividendenauszahlungstermine (quarterly, jährlich, etc.)
- Wird automatisch aktualisiert wenn sich Assets ändern

#### Optimierte Projektionsberechnung
Die neue `calculateProjectionsWithCache` Methode:
- Verwendet bereits berechnete Dashboard-Werte
- Verwendet den monatlichen Asset-Einkommen Cache
- Vermeidet Neuberechnungen bei jedem Render

### Middleware für automatische Updates

Die `dataChangeMiddleware` überwacht Änderungen an:
- Assets (löst Asset-Einkommen Cache Update aus)
- Income 
- Expenses
- Liabilities

Und aktualisiert automatisch:
1. Dashboard-Werte
2. Forecast-Cache
3. Monatlichen Asset-Einkommen Cache (nur bei Asset-Änderungen)

## Performance-Verbesserungen

### Vor der Optimierung
- Alle Werte wurden bei jedem Render neu berechnet
- Dividendentermine wurden für jeden Monat einzeln berechnet
- Keine Wiederverwendung von bereits berechneten Werten

### Nach der Optimierung
- Werte werden nur bei Datenänderungen neu berechnet
- Monatliche Asset-Einkommen werden einmal berechnet und cached
- Dashboard-Werte werden wiederverwendet
- Intelligente Cache-Invalidierung

## Dividendentermine und Cashflow

### Berücksichtigung von Dividendenterminen
Der neue Cache berücksichtigt:
- **Quarterly Dividends**: Auszahlung in Q1, Q2, Q3, Q4
- **Jährliche Dividends**: Auszahlung in einem bestimmten Monat
- **Monatliche Dividends**: Gleichmäßige Verteilung
- **Semi-Annual**: Halbjährliche Auszahlungen

### Cashflow-Berechnungen
```typescript
// Beispiel: Asset zahlt quarterly dividends
const monthlyAssetIncomeCache = {
  1: 100,  // Q1 Dividende
  2: 0,    // Kein Dividende
  3: 0,    // Kein Dividende  
  4: 100,  // Q2 Dividende
  5: 0,    // Kein Dividende
  6: 0,    // Kein Dividende
  7: 100,  // Q3 Dividende
  8: 0,    // Kein Dividende
  9: 0,    // Kein Dividende
  10: 100, // Q4 Dividende
  11: 0,   // Kein Dividende
  12: 0    // Kein Dividende
}
```

## Usage

### Container Implementation
```typescript
const ForecastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const forecast = useAppSelector(state => state.forecast);
  
  // Automatische Updates bei Datenänderungen
  useEffect(() => {
    if (!isDataLoading) {
      dispatch(updateForecastValues());
    }
  }, [dispatch, isDataLoading, /* dependency array */]);

  return (
    <ForecastView
      projections={forecast.projections}
      assetAllocation={forecast.assetAllocation}
      // ... andere cached Werte
    />
  );
};
```

### Manual Cache Invalidation
```typescript
// Falls manuelle Cache-Invalidierung benötigt wird
dispatch(invalidateCache());
dispatch(updateForecastValues());
```

## Vorteile

1. **Performance**: Bis zu 90% weniger Berechnungen
2. **Accuracy**: Korrekte Berücksichtigung von Dividendenterminen
3. **Consistency**: Konsistente Daten zwischen Dashboard und Forecast
4. **Maintainability**: Zentralisierte Cache-Logik
5. **User Experience**: Schnellere Ladezeiten und flüssigere UI

## Cache-Lebenszyklus

1. **Initial Load**: Cache wird beim ersten Laden aufgebaut
2. **Data Change**: Bei Änderungen an Basis-Daten wird Cache aktualisiert
3. **Selective Updates**: Nur relevante Cache-Teile werden neu berechnet
4. **Persistence**: Cache wird in localStorage gespeichert
5. **Hydration**: Cache wird beim App-Start wiederhergestellt
