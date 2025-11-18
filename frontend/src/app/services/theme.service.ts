import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Theme preference type - includes 'auto' for system detection
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Effective theme type - resolved to actual light/dark value
 */
export type EffectiveTheme = 'light' | 'dark';

/**
 * ThemeService - Manages application theme state using Angular signals
 *
 * Features:
 * - Signal-based state (zoneless-compatible)
 * - Persists to localStorage
 * - Detects system preference via matchMedia
 * - Resolves 'auto' to effective light/dark theme
 *
 * @example
 * ```typescript
 * // In a component
 * private themeService = inject(ThemeService);
 * readonly currentTheme = this.themeService.effectiveTheme;
 *
 * toggleTheme(): void {
 *   this.themeService.toggleTheme();
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly STORAGE_KEY = 'tasker-theme';

  /**
   * User's theme preference
   * Can be 'light', 'dark', or 'auto' (follows system)
   */
  private readonly themeSignal = signal<Theme>('auto');

  /**
   * System preference detection
   * Tracks whether system prefers dark mode
   */
  private readonly systemPrefersDarkSignal = signal<boolean>(false);

  /**
   * Read-only access to user's theme preference
   */
  readonly theme = this.themeSignal.asReadonly();

  /**
   * Read-only access to system preference
   */
  readonly systemPrefersDark = this.systemPrefersDarkSignal.asReadonly();

  /**
   * Computed effective theme - resolves 'auto' to actual light/dark
   * This is what should be applied to the UI
   */
  readonly effectiveTheme = computed<EffectiveTheme>(() => {
    const currentTheme = this.themeSignal();

    if (currentTheme === 'auto') {
      return this.systemPrefersDarkSignal() ? 'dark' : 'light';
    }

    return currentTheme;
  });

  constructor() {
    // Only run browser-specific initialization on client-side
    if (this.isBrowser) {
      this.initializeSystemPreference();
      this.loadSavedTheme();
      this.setupPersistenceEffect();
    }
  }

  /**
   * Set theme preference
   * Updates signal and triggers localStorage save via effect
   */
  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  /**
   * Toggle theme through sequence: light -> dark -> auto -> light
   */
  toggleTheme(): void {
    const current = this.themeSignal();

    const nextTheme: Theme = current === 'light'
      ? 'dark'
      : current === 'dark'
        ? 'auto'
        : 'light';

    this.setTheme(nextTheme);
  }

  /**
   * Initialize system preference detection
   * Sets up matchMedia listener for changes
   */
  private initializeSystemPreference(): void {
    if (!window.matchMedia) {
      // Fallback for browsers without matchMedia support
      this.systemPrefersDarkSignal.set(false);
      return;
    }

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Set initial value
    this.systemPrefersDarkSignal.set(darkModeQuery.matches);

    // Listen for changes
    const listener = (event: MediaQueryListEvent): void => {
      this.systemPrefersDarkSignal.set(event.matches);
    };

    // Use addEventListener for better browser compatibility
    darkModeQuery.addEventListener('change', listener);

    // Note: Not cleaning up listener as service is singleton
    // If needed for testing, could expose cleanup method
  }

  /**
   * Load saved theme from localStorage
   * Falls back to 'auto' if unavailable or invalid
   */
  private loadSavedTheme(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);

      if (saved && this.isValidTheme(saved)) {
        this.themeSignal.set(saved as Theme);
      }
    } catch (error) {
      // localStorage unavailable (private browsing, etc.)
      // Silently fail and use default 'auto'
      console.warn('ThemeService: localStorage unavailable, using default theme', error);
    }
  }

  /**
   * Setup effect to persist theme changes to localStorage
   */
  private setupPersistenceEffect(): void {
    effect(() => {
      const currentTheme = this.themeSignal();

      try {
        localStorage.setItem(this.STORAGE_KEY, currentTheme);
      } catch (error) {
        // localStorage unavailable or quota exceeded
        // Silently fail - theme will still work for current session
        console.warn('ThemeService: Failed to save theme preference', error);
      }
    });
  }

  /**
   * Type guard for theme validation
   */
  private isValidTheme(value: string): value is Theme {
    return value === 'light' || value === 'dark' || value === 'auto';
  }
}
