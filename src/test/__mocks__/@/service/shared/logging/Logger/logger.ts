// Mock Logger for tests
const Logger = {
  infoService: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

export default Logger;