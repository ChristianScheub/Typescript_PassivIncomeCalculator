# stockAPIService (Functional Object Pattern)

Der `stockAPIService` bietet eine schlanke, flexible und moderne Schnittstelle für alle wichtigen Aktien-APIs (Finnhub, Yahoo, Alpha Vantage). Die Auswahl des Providers und API-Keys erfolgt automatisch über den Redux-Store. Die Implementierung folgt dem Functional Object Pattern – keine Factories, keine Singletons, keine Gateway- oder Helper-Altlasten mehr.

## Features
- Dynamische Provider-Auswahl (Redux-gesteuert)
- Methoden: `getCurrentStockPrice`, `getHistory`, `getHistory30Days`, `getIntradayHistory`
- Provider-spezifische Implementierungen gekapselt in `/providers`
- Typsicherheit durch Interface
- Fehlerhandling und Logging in den Providern

## Nutzung
```typescript
import { stockAPIService } from '@/service/domain/assets/market-data/stockAPIService';

const price = await stockAPIService.getCurrentStockPrice('AAPL.US');
const history = await stockAPIService.getHistory('AAPL.US', 30);
```

## Hinweise
- Die gesamte Factory-, Gateway- und Helper-Logik ist entfernt.
- Die Datei ist jetzt maximal wartbar und flexibel.
- Provider können einfach erweitert werden.
