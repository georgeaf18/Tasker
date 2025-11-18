# ThemeService Usage Guide

## Overview

The `ThemeService` provides signal-based theme management with support for light, dark, and auto (system-detected) themes. It persists user preferences to localStorage and automatically detects system theme changes.

## Quick Start

### Basic Component Integration

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <div>
      <p>Current theme: {{ themeService.theme() }}</p>
      <p>Effective theme: {{ themeService.effectiveTheme() }}</p>

      <button (click)="toggleTheme()">
        Toggle Theme
      </button>

      <div class="theme-buttons">
        <button (click)="setLight()">Light</button>
        <button (click)="setDark()">Dark</button>
        <button (click)="setAuto()">Auto</button>
      </div>
    </div>
  `
})
export class ThemeToggleComponent {
  // Inject the service
  themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setLight(): void {
    this.themeService.setTheme('light');
  }

  setDark(): void {
    this.themeService.setTheme('dark');
  }

  setAuto(): void {
    this.themeService.setTheme('auto');
  }
}
```

## API Reference

### Signals

#### `theme: Signal<Theme>`
- **Type:** `'light' | 'dark' | 'auto'`
- **Description:** User's theme preference (read-only)
- **Example:**
  ```typescript
  const currentTheme = this.themeService.theme(); // 'light', 'dark', or 'auto'
  ```

#### `effectiveTheme: Signal<EffectiveTheme>`
- **Type:** `'light' | 'dark'`
- **Description:** Resolved theme (auto → actual light/dark based on system)
- **Example:**
  ```typescript
  const activeTheme = this.themeService.effectiveTheme(); // 'light' or 'dark'
  ```

#### `systemPrefersDark: Signal<boolean>`
- **Type:** `boolean`
- **Description:** Whether system prefers dark mode
- **Example:**
  ```typescript
  const isDarkMode = this.themeService.systemPrefersDark();
  ```

### Methods

#### `setTheme(theme: Theme): void`
Sets the theme preference and persists to localStorage.

```typescript
this.themeService.setTheme('dark');    // Explicit dark mode
this.themeService.setTheme('light');   // Explicit light mode
this.themeService.setTheme('auto');    // Follow system preference
```

#### `toggleTheme(): void`
Cycles through themes: `light → dark → auto → light`

```typescript
this.themeService.toggleTheme();
```

## Advanced Usage

### Applying Theme to DOM

```typescript
import { Component, inject, effect } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<router-outlet />`
})
export class AppComponent {
  private themeService = inject(ThemeService);

  constructor() {
    // Apply theme class to <html> element whenever effectiveTheme changes
    effect(() => {
      const theme = this.themeService.effectiveTheme();
      document.documentElement.classList.remove('light-theme', 'dark-theme');
      document.documentElement.classList.add(`${theme}-theme`);
    });
  }
}
```

### Using with Computed Signals

```typescript
import { Component, inject, computed } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div>
      <p>Theme icon: {{ themeIcon() }}</p>
      <p>Is dark mode: {{ isDarkMode() }}</p>
    </div>
  `
})
export class SettingsComponent {
  private themeService = inject(ThemeService);

  // Derive new computed signals from theme state
  isDarkMode = computed(() => {
    return this.themeService.effectiveTheme() === 'dark';
  });

  themeIcon = computed(() => {
    const theme = this.themeService.theme();
    return theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🔄';
  });
}
```

### Conditional Rendering Based on Theme

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header>
      @if (themeService.effectiveTheme() === 'dark') {
        <img src="/assets/logo-dark.png" alt="Logo">
      } @else {
        <img src="/assets/logo-light.png" alt="Logo">
      }
    </header>
  `
})
export class HeaderComponent {
  themeService = inject(ThemeService);
}
```

### Using with Effect for Side Effects

```typescript
import { Component, inject, effect } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  template: ``
})
export class AnalyticsComponent {
  private themeService = inject(ThemeService);

  constructor() {
    // Track theme changes in analytics
    effect(() => {
      const theme = this.themeService.theme();
      console.log('Theme changed to:', theme);
      // analytics.track('theme_changed', { theme });
    });
  }
}
```

## PrimeNG Integration

```typescript
import { Component, inject, effect } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<router-outlet />`
})
export class AppComponent {
  private themeService = inject(ThemeService);

  constructor() {
    // Switch PrimeNG theme based on effective theme
    effect(() => {
      const theme = this.themeService.effectiveTheme();
      const themeLink = document.getElementById('app-theme') as HTMLLinkElement;

      if (themeLink) {
        themeLink.href = `${theme}-theme.css`; // e.g., 'dark-theme.css'
      }
    });
  }
}
```

## Tailwind CSS Integration

### Option 1: CSS Classes

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div [class]="cardClasses()">
      <h2>Card Title</h2>
      <p>Card content</p>
    </div>
  `
})
export class CardComponent {
  themeService = inject(ThemeService);

  cardClasses = computed(() => {
    const isDark = this.themeService.effectiveTheme() === 'dark';
    return isDark
      ? 'bg-gray-800 text-white border-gray-700'
      : 'bg-white text-gray-900 border-gray-200';
  });
}
```

### Option 2: Dark Mode Class Strategy

```typescript
// In app.component.ts
import { Component, inject, effect } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<router-outlet />`
})
export class AppComponent {
  private themeService = inject(ThemeService);

  constructor() {
    // Apply 'dark' class to <html> for Tailwind dark mode
    effect(() => {
      const isDark = this.themeService.effectiveTheme() === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
    });
  }
}
```

Then in your Tailwind config:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  // ... rest of config
}
```

Now use Tailwind's dark mode utilities:

```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content adapts to theme automatically
</div>
```

## Testing

### Testing Components That Use ThemeService

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeService } from './services/theme.service';
import { signal } from '@angular/core';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;

  beforeEach(() => {
    // Create mock service
    mockThemeService = {
      theme: signal('light'),
      effectiveTheme: signal('light'),
      systemPrefersDark: signal(false),
      setTheme: jest.fn(),
      toggleTheme: jest.fn()
    } as unknown as ThemeService;

    TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        { provide: ThemeService, useValue: mockThemeService }
      ]
    });

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should respond to theme changes', () => {
    // Update mock signal
    mockThemeService.effectiveTheme.set('dark');
    fixture.detectChanges();

    // Assert component updated
    expect(component.isDarkMode()).toBe(true);
  });
});
```

## Best Practices

1. **Use `effectiveTheme` for UI rendering** - It resolves 'auto' to actual light/dark
2. **Use `theme` for showing user preference** - Displays what user explicitly selected
3. **Apply theme at root level** - Use effect in AppComponent to apply theme globally
4. **Leverage computed signals** - Derive UI state from theme signals
5. **Test with mocks** - Mock ThemeService in component tests for isolation

## Troubleshooting

### Theme not persisting between sessions
- Check browser localStorage is available (not disabled, not in private mode)
- Verify localStorage key 'tasker-theme' exists after setting theme
- Check console for localStorage errors

### System theme detection not working
- Ensure browser supports `prefers-color-scheme` media query
- Test in browser DevTools: Open DevTools → Rendering → "Emulate CSS prefers-color-scheme"
- Service logs warnings to console if matchMedia unavailable

### Theme not updating UI
- Ensure you're using `effectiveTheme()` not `theme()` for rendering
- Verify effect or computed is properly set up to react to signal changes
- Check that component is not using OnPush change detection without signal binding
