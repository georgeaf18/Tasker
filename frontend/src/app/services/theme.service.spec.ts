import { TestBed } from '@angular/core/testing';
import { ThemeService, Theme, EffectiveTheme } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageMock: { [key: string]: string };
  let matchMediaMock: MediaQueryList;
  let matchMediaListeners: ((event: MediaQueryListEvent) => void)[];

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock = {};
    matchMediaListeners = [];

    // Mock console.warn to avoid noise in test output
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock localStorage
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return localStorageMock[key] || null;
    });

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jest.fn((
        _event: string,
        listener: (event: MediaQueryListEvent) => void
      ) => {
        matchMediaListeners.push(listener);
      }),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      onchange: null,
      dispatchEvent: jest.fn().mockReturnValue(true)
    };

    // Define matchMedia on window object for tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockReturnValue(matchMediaMock)
    });

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  describe('initialization', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should default to auto theme when no saved preference', () => {
      expect(service.theme()).toBe('auto');
    });

    it('should load saved theme from localStorage', () => {
      // Setup saved preference before creating service
      localStorageMock['tasker-theme'] = 'dark';

      // Reset and create fresh TestBed with updated mock
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService]
      });

      const newService = TestBed.inject(ThemeService);

      expect(newService.theme()).toBe('dark');
    });

    it('should ignore invalid theme values from localStorage', () => {
      localStorageMock['tasker-theme'] = 'invalid-theme';

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService]
      });

      const newService = TestBed.inject(ThemeService);

      expect(newService.theme()).toBe('auto');
    });

    it('should detect system dark mode preference', () => {
      // Setup dark mode preference
      const darkModeMediaQuery = {
        ...matchMediaMock,
        matches: true
      };

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: jest.fn().mockReturnValue(darkModeMediaQuery)
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService]
      });

      const newService = TestBed.inject(ThemeService);

      expect(newService.systemPrefersDark()).toBe(true);
    });

    it('should detect system light mode preference', () => {
      // matchMediaMock.matches is already false from beforeEach
      expect(service.systemPrefersDark()).toBe(false);
    });

    it('should handle missing matchMedia gracefully', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: undefined
      });

      expect(() => {
        TestBed.inject(ThemeService);
      }).not.toThrow();
    });
  });

  describe('setTheme', () => {
    it('should update theme to light', () => {
      service.setTheme('light');

      expect(service.theme()).toBe('light');
    });

    it('should update theme to dark', () => {
      service.setTheme('dark');

      expect(service.theme()).toBe('dark');
    });

    it('should update theme to auto', () => {
      service.setTheme('light');
      service.setTheme('auto');

      expect(service.theme()).toBe('auto');
    });

    it('should persist theme to localStorage', () => {
      service.setTheme('dark');

      // Allow effect to run
      TestBed.flushEffects();

      expect(Storage.prototype.setItem).toHaveBeenCalledWith('tasker-theme', 'dark');
    });

    it('should handle localStorage errors gracefully', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });

      expect(() => {
        service.setTheme('dark');
        TestBed.flushEffects();
      }).not.toThrow();
    });
  });

  describe('toggleTheme', () => {
    it('should cycle from auto to light', () => {
      service.setTheme('auto');
      service.toggleTheme();

      expect(service.theme()).toBe('light');
    });

    it('should cycle from light to dark', () => {
      service.setTheme('light');
      service.toggleTheme();

      expect(service.theme()).toBe('dark');
    });

    it('should cycle from dark to auto', () => {
      service.setTheme('dark');
      service.toggleTheme();

      expect(service.theme()).toBe('auto');
    });

    it('should complete full cycle: auto -> light -> dark -> auto', () => {
      service.setTheme('auto');

      service.toggleTheme();
      expect(service.theme()).toBe('light');

      service.toggleTheme();
      expect(service.theme()).toBe('dark');

      service.toggleTheme();
      expect(service.theme()).toBe('auto');
    });
  });

  describe('effectiveTheme computed signal', () => {
    it('should return light when theme is light', () => {
      service.setTheme('light');

      expect(service.effectiveTheme()).toBe('light');
    });

    it('should return dark when theme is dark', () => {
      service.setTheme('dark');

      expect(service.effectiveTheme()).toBe('dark');
    });

    it('should resolve auto to light when system prefers light', () => {
      matchMediaMock.matches = false;
      const newService = TestBed.inject(ThemeService);

      newService.setTheme('auto');

      expect(newService.effectiveTheme()).toBe('light');
    });

    it('should resolve auto to dark when system prefers dark', () => {
      // Setup dark mode preference
      const darkModeMediaQuery = {
        ...matchMediaMock,
        matches: true
      };

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: jest.fn().mockReturnValue(darkModeMediaQuery)
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService]
      });

      const newService = TestBed.inject(ThemeService);
      newService.setTheme('auto');

      expect(newService.effectiveTheme()).toBe('dark');
    });

    it('should update effectiveTheme when system preference changes', () => {
      service.setTheme('auto');

      // Initially light
      expect(service.effectiveTheme()).toBe('light');

      // Simulate system changing to dark mode
      const event = { matches: true } as MediaQueryListEvent;
      matchMediaListeners.forEach(listener => listener(event));

      expect(service.effectiveTheme()).toBe('dark');
    });

    it('should not affect effectiveTheme when system changes but theme is explicit', () => {
      service.setTheme('light');

      expect(service.effectiveTheme()).toBe('light');

      // System changes to dark
      const event = { matches: true } as MediaQueryListEvent;
      matchMediaListeners.forEach(listener => listener(event));

      // Should still be light (user preference overrides system)
      expect(service.effectiveTheme()).toBe('light');
    });
  });

  describe('localStorage persistence', () => {
    it('should save theme changes to localStorage', () => {
      service.setTheme('dark');
      TestBed.flushEffects();

      expect(localStorageMock['tasker-theme']).toBe('dark');
    });

    it('should update localStorage on multiple theme changes', () => {
      service.setTheme('light');
      TestBed.flushEffects();

      expect(localStorageMock['tasker-theme']).toBe('light');

      service.setTheme('dark');
      TestBed.flushEffects();

      expect(localStorageMock['tasker-theme']).toBe('dark');
    });

    it('should handle localStorage.getItem errors gracefully', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Access denied');
      });

      expect(() => {
        TestBed.inject(ThemeService);
      }).not.toThrow();
    });
  });

  describe('type safety', () => {
    it('should expose correct type for theme signal', () => {
      const theme: Theme = service.theme();
      expect(['light', 'dark', 'auto']).toContain(theme);
    });

    it('should expose correct type for effectiveTheme computed', () => {
      const effectiveTheme: EffectiveTheme = service.effectiveTheme();
      expect(['light', 'dark']).toContain(effectiveTheme);
    });

    it('should expose correct type for systemPrefersDark signal', () => {
      const prefersDark: boolean = service.systemPrefersDark();
      expect(typeof prefersDark).toBe('boolean');
    });
  });

  describe('zoneless compatibility', () => {
    it('should use signals for all state management', () => {
      // Verify signal-based reactivity works without zone.js
      service.setTheme('dark');

      // Signal should immediately reflect change (no async tick needed)
      expect(service.theme()).toBe('dark');
      expect(service.effectiveTheme()).toBe('dark');
    });

    it('should update computed signals synchronously', () => {
      service.setTheme('auto');

      // Change system preference
      const event = { matches: true } as MediaQueryListEvent;
      matchMediaListeners.forEach(listener => listener(event));

      // Computed should update immediately
      expect(service.effectiveTheme()).toBe('dark');
    });
  });
});
