import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let originalUptime: () => number;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);

    // Mock process.uptime for consistent testing
    originalUptime = process.uptime;
    process.uptime = jest.fn(() => 123.456);
  });

  afterEach(() => {
    // Restore original process.uptime
    process.uptime = originalUptime;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status with ok status', () => {
      const result = controller.check();

      expect(result.status).toBe('ok');
    });

    it('should return health status with ISO 8601 timestamp', () => {
      const result = controller.check();

      // Verify timestamp is valid ISO 8601 format
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      // Verify it's a recent timestamp (within last second)
      const timestamp = new Date(result.timestamp);
      const now = new Date();
      const diff = now.getTime() - timestamp.getTime();
      expect(diff).toBeLessThan(1000);
    });

    it('should return health status with uptime in seconds', () => {
      const result = controller.check();

      expect(result.uptime).toBe(123.456);
      expect(typeof result.uptime).toBe('number');
    });

    it('should return complete health response structure', () => {
      const result = controller.check();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(Object.keys(result)).toHaveLength(3);
    });
  });
});
