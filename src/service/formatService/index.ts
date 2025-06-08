import { IFormatService } from './interfaces/IFormatService';
import { formatCurrency } from './methods/formatCurrency';
import { formatPercentage } from './methods/formatPercentage';

class FormatService implements IFormatService {
  formatCurrency = formatCurrency;
  formatPercentage = formatPercentage;
}

export default new FormatService();
