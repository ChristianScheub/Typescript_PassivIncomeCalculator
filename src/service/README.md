# Service Layer

Die Service-Schicht kapselt die Geschäftslogik und externe Integrationen der Anwendung. Sie stellt wiederverwendbare Funktionen und Klassen bereit, die von Containern, Views und anderen Komponenten genutzt werden.

## Aufbau
- Jeder Service ist in einem eigenen Unterordner oder als Datei organisiert.
- Services sind lose gekoppelt und können unabhängig getestet und erweitert werden.
- Typische Aufgaben: Datenberechnung, API-Kommunikation, Formatierung, Logging, Datenbankzugriffe.

## Nutzung
Services werden in Containern, Slices oder direkt in UI-Komponenten importiert und genutzt. Beispiel:

```typescript
import calculatorService from './calculatorService';
const income = calculatorService.calculateTotalMonthlyIncome(incomes);
```

## Übersicht der wichtigsten Services
- **calculatorService**: Berechnet finanzielle Kennzahlen und Prognosen.
- **dividendCacheService**: Optimiert Dividendenberechnungen durch Caching.
- **formatService**: Stellt Formatierungsfunktionen für Währungen, Prozente etc. bereit.
- **exchangeService**: Holt und konvertiert Wechselkurse.
- **stockAPIService**: Bindet externe Aktien-APIs an.
- **sqlLiteService**: Persistiert Daten lokal mit SQLite.
- **Logger**: Zentrale Logging-Funktionalität.

---

## UML Klassendiagramm (Beispiel)
```mermaid
classDiagram
    class CalculatorService {
      +calculateTotalMonthlyIncome()
      +calculateProjections()
      +calculateAssetMonthlyIncomeWithCache()
    }
    class DividendCacheService {
      +calculateAssetIncomeWithCache()
      +calculateTotalMonthlyAssetIncomeWithCache()
    }
    class FormatService {
      +formatCurrency()
      +formatPercentage()
    }
    class Logger {
      +infoService()
      +error()
      +cache()
    }
    CalculatorService --> DividendCacheService
    CalculatorService --> FormatService
    DividendCacheService --> Logger
```

---

## UML Methodenabhängigkeiten (Beispiel)
```mermaid
flowchart TD
    A[calculateProjections] --> B[calculateTotalMonthlyIncome]
    A --> C[calculateTotalMonthlyAssetIncomeWithCache]
    C --> D[calculateAssetIncomeWithCache]
    D --> E[Logger]
```

```mermaid
flowchart TD
    F[calculateAssetMonthlyIncomeWithCache] --> G[getCachedDividendData]
    F --> H[calculateAssetIncomeBreakdown]
    H --> I[calculateDividendSchedule]
    H --> J[calculateDividendForMonth]
```

---

## UML Ablaufdiagramm: Interner Flow zwischen Services
```mermaid
sequenceDiagram
    participant UI
    participant CalculatorService
    participant DividendCacheService
    participant Logger
    UI->>CalculatorService: calculateProjections()
    CalculatorService->>DividendCacheService: calculateTotalMonthlyAssetIncomeWithCache()
    DividendCacheService->>Logger: cache()
    DividendCacheService-->>CalculatorService: assetIncome
    CalculatorService-->>UI: projections
```

---

## Fazit
Die Service-Schicht ist das Rückgrat der Geschäftslogik und sorgt für eine klare Trennung zwischen UI und Logik. Die UML-Diagramme helfen, die Abhängigkeiten und Abläufe zu verstehen.
