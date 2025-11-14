import { TestBed } from '@angular/core/testing';
import { ChannelApiService } from './channel-api.service';
import { Workspace } from '../models/workspace.enum';

describe('ChannelApiService', () => {
  let service: ChannelApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChannelApiService],
    });
    service = TestBed.inject(ChannelApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getChannels()', () => {
    it('should return all channels when no workspace filter is provided', (done) => {
      service.getChannels().subscribe((channels) => {
        expect(channels).toHaveLength(6);
        expect(channels.some((c) => c.workspace === Workspace.WORK)).toBe(true);
        expect(channels.some((c) => c.workspace === Workspace.PERSONAL)).toBe(
          true,
        );
        done();
      });
    });

    it('should return only WORK channels when WORK workspace filter is provided', (done) => {
      service.getChannels(Workspace.WORK).subscribe((channels) => {
        expect(channels).toHaveLength(3);
        expect(channels.every((c) => c.workspace === Workspace.WORK)).toBe(
          true,
        );
        expect(channels.find((c) => c.name === 'Frontend')).toBeTruthy();
        expect(channels.find((c) => c.name === 'Backend')).toBeTruthy();
        expect(channels.find((c) => c.name === 'Design')).toBeTruthy();
        done();
      });
    });

    it('should return only PERSONAL channels when PERSONAL workspace filter is provided', (done) => {
      service.getChannels(Workspace.PERSONAL).subscribe((channels) => {
        expect(channels).toHaveLength(3);
        expect(channels.every((c) => c.workspace === Workspace.PERSONAL)).toBe(
          true,
        );
        expect(channels.find((c) => c.name === 'Home')).toBeTruthy();
        expect(channels.find((c) => c.name === 'Learning')).toBeTruthy();
        expect(channels.find((c) => c.name === 'Health')).toBeTruthy();
        done();
      });
    });

    it('should simulate network delay', (done) => {
      const startTime = Date.now();
      service.getChannels().subscribe(() => {
        const endTime = Date.now();
        const elapsed = endTime - startTime;
        // Should take at least 90ms (100ms delay minus some variance)
        expect(elapsed).toBeGreaterThanOrEqual(90);
        done();
      });
    });

    it('should return channels with all required properties', (done) => {
      service.getChannels().subscribe((channels) => {
        channels.forEach((channel) => {
          expect(channel.id).toBeDefined();
          expect(channel.name).toBeDefined();
          expect(channel.workspace).toBeDefined();
          expect(channel.color).toBeDefined();
          expect(channel.createdAt).toBeInstanceOf(Date);
        });
        done();
      });
    });

    it('should return channels with valid color codes', (done) => {
      service.getChannels().subscribe((channels) => {
        channels.forEach((channel) => {
          expect(channel.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
        done();
      });
    });
  });

  describe('getChannel()', () => {
    it('should return a specific channel by ID', (done) => {
      service.getChannel(1).subscribe((channel) => {
        expect(channel).toBeDefined();
        expect(channel?.id).toBe(1);
        expect(channel?.name).toBe('Frontend');
        expect(channel?.workspace).toBe(Workspace.WORK);
        done();
      });
    });

    it('should return undefined for non-existent channel ID', (done) => {
      service.getChannel(999).subscribe((channel) => {
        expect(channel).toBeUndefined();
        done();
      });
    });

    it('should return a PERSONAL workspace channel', (done) => {
      service.getChannel(4).subscribe((channel) => {
        expect(channel).toBeDefined();
        expect(channel?.id).toBe(4);
        expect(channel?.name).toBe('Home');
        expect(channel?.workspace).toBe(Workspace.PERSONAL);
        done();
      });
    });

    it('should simulate network delay', (done) => {
      const startTime = Date.now();
      service.getChannel(1).subscribe(() => {
        const endTime = Date.now();
        const elapsed = endTime - startTime;
        // Should take at least 40ms (50ms delay minus some variance)
        expect(elapsed).toBeGreaterThanOrEqual(40);
        done();
      });
    });

    it('should return channel with all required properties', (done) => {
      service.getChannel(2).subscribe((channel) => {
        expect(channel).toBeDefined();
        expect(channel?.id).toBe(2);
        expect(channel?.name).toBe('Backend');
        expect(channel?.workspace).toBe(Workspace.WORK);
        expect(channel?.color).toBe('#7A9B76');
        expect(channel?.createdAt).toBeInstanceOf(Date);
        done();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid getChannels calls', (done) => {
      let callbackCount = 0;
      const expectedCalls = 3;

      for (let i = 0; i < expectedCalls; i++) {
        service.getChannels().subscribe((channels) => {
          expect(channels).toHaveLength(6);
          callbackCount++;
          if (callbackCount === expectedCalls) {
            done();
          }
        });
      }
    });

    it('should handle multiple rapid getChannel calls for different IDs', (done) => {
      let callbackCount = 0;
      const ids = [1, 2, 3];

      ids.forEach((id) => {
        service.getChannel(id).subscribe((channel) => {
          expect(channel?.id).toBe(id);
          callbackCount++;
          if (callbackCount === ids.length) {
            done();
          }
        });
      });
    });

    it('should return consistent data across multiple calls', (done) => {
      service.getChannels().subscribe((firstCallChannels) => {
        service.getChannels().subscribe((secondCallChannels) => {
          expect(firstCallChannels).toEqual(secondCallChannels);
          done();
        });
      });
    });

    it('should handle zero as channel ID lookup', (done) => {
      service.getChannel(0).subscribe((channel) => {
        expect(channel).toBeUndefined();
        done();
      });
    });

    it('should handle negative channel ID lookup', (done) => {
      service.getChannel(-1).subscribe((channel) => {
        expect(channel).toBeUndefined();
        done();
      });
    });
  });
});
