import { IFormatService } from './interfaces/IFormatService';
import { formatCurrency } from './methods/formatCurrency';
import { formatPercentage } from './methods/formatPercentage';

const formatService: IFormatService = {
  formatCurrency,
  formatPercentage,
};

export default formatService;
