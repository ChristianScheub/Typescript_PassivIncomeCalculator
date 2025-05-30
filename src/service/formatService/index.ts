import { IFormatService } from './interfaces/IFormatService';
import { formatCurrency } from './methods/formatCurrency';
import { formatPercentage } from './methods/formatPercentage';
import { formatNumber } from './methods/formatNumber';
import { formatDate, formatMonth } from './methods/formatDate';

class FormatService implements IFormatService {
  formatCurrency = formatCurrency;
  formatPercentage = formatPercentage;
  formatNumber = formatNumber;
  formatDate = formatDate;
  formatMonth = formatMonth;
}

export default new FormatService();
