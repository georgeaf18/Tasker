# ADR-003: Use PrimeNG + Tailwind CSS

**Status:** Accepted
**Date:** 2025-11-12
**Decision Makers:** George
**Tags:** frontend, ui, styling

## Context

For Tasker's UI, we need:

- Pre-built complex components (datepicker, dropdown, drag-drop)
- Dyslexia-friendly, ADHD-friendly design system
- Light/dark mode support
- Accessibility (WCAG 2.1 AA)
- Fast development without building everything from scratch
- Full control over custom component styling
- Responsive design

## Decision

We will use:

- **PrimeNG** for complex pre-built components
- **Tailwind CSS** for utility-first styling and custom components
- **PrimeNG Themes** customized to match design system

## Rationale

### Why PrimeNG?

1. **Comprehensive Component Library**
   - 90+ components ready to use
   - Complex components: Calendar, Dropdown, Tree, DataTable
   - Drag & Drop support built-in
   - Overlays and dialogs

2. **Angular Native**
   - Built for Angular, not a wrapper
   - Uses Angular patterns (directives, pipes)
   - Standalone component support
   - Works with signals and zoneless

3. **Accessibility**
   - WCAG 2.1 compliant
   - Keyboard navigation
   - Screen reader support
   - ARIA attributes

4. **Theming System**
   - New Aura theme system (PrimeNG 18+)
   - CSS variables for customization
   - Dark mode built-in
   - Can override with Tailwind

5. **Active Development**
   - Regular updates
   - Large community
   - Good documentation
   - Commercial support available

### Why Tailwind CSS?

1. **Utility-First Approach**
   - Rapid prototyping
   - No CSS file bloat
   - Consistent spacing/sizing
   - Easy responsive design

2. **Design Token Integration**
   - Configure colors, spacing, fonts
   - Match design system exactly
   - Reusable utilities
   - Type-safe with plugins

3. **Custom Component Styling**
   - Full control over layout
   - Apply dyslexia-friendly styles
   - Override PrimeNG styles when needed
   - Component-specific utilities

4. **Development Speed**
   - No context switching (HTML + styles together)
   - Autocomplete with IDE plugins
   - JIT mode (only used classes)
   - Small production bundle

5. **Works Well with PrimeNG**
   - Can use both together
   - Tailwind for layout, PrimeNG for complex UI
   - Override PrimeNG themes with Tailwind classes
   - CSS layers prevent conflicts

### Why Not Other Options?

**Angular Material**

- ❌ Less flexible theming
- ❌ Material Design aesthetic (not our design)
- ❌ Heavier bundle size
- ✅ Good accessibility
- **Verdict:** Too opinionated on design

**Ant Design Angular**

- ❌ Less active development
- ❌ Smaller community
- ❌ Fewer components than PrimeNG
- **Verdict:** Less mature

**Headless UI + Tailwind**

- ✅ Full control
- ❌ Must build everything from scratch
- ❌ No complex components (datepicker, dropdown)
- **Verdict:** Too much work for v0.1

**Bootstrap + ng-bootstrap**

- ❌ jQuery-like patterns
- ❌ Dated aesthetic
- ❌ Less flexible
- **Verdict:** Not modern enough

## Implementation Strategy

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Design system colors
        primary: '#8B7BB8',
        secondary: '#6B9AC4',
        accent: '#C89FA7',
        destructive: '#C97064',
        success: '#7A9B76',
        'bg-primary': '#FAF9F7',
        'bg-secondary': '#F0EEE9',
        'text-primary': '#2B2B2A',
        'text-secondary': '#595959',
      },
      fontFamily: {
        sans: ['Verdana', 'Open Sans', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        base: '22px', // Dyslexia-friendly
        lg: '26px',
        xl: '33px',
      },
      spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        '2xl': '64px',
      },
      letterSpacing: {
        wide: '0.12em', // Dyslexia-friendly
      },
      lineHeight: {
        relaxed: '1.5', // Dyslexia-friendly
      },
    },
  },
  plugins: [],
};
```

### PrimeNG Theme Customization

```typescript
// app.config.ts
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

const TaskerPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f5f3f9',
      100: '#ebe7f3',
      500: '#8B7BB8', // Our primary color
      600: '#7a6ba3',
      700: '#685b8d',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#FAF9F7', // Our bg-primary
          50: '#F0EEE9', // Our bg-secondary
        },
      },
      dark: {
        surface: {
          0: '#1C1B1A',
          50: '#2B2A28',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: TaskerPreset,
        options: {
          darkModeSelector: '[data-theme="dark"]',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities',
          },
        },
      },
    }),
  ],
};
```

### Component Usage Pattern

```typescript
// Example: Task card using both PrimeNG and Tailwind
@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CardModule, ButtonModule, TagModule],
  template: `
    <p-card class="bg-bg-primary border-2 border-primary rounded-lg p-md">
      <!-- PrimeNG Card, Tailwind utilities -->
      <div class="flex justify-between items-start mb-sm">
        <h3 class="text-lg font-semibold text-text-primary tracking-wide">
          {{ task.title }}
        </h3>

        <!-- PrimeNG Tag for status -->
        <p-tag [value]="task.status" [severity]="getStatusSeverity()" />
      </div>

      <p class="text-base text-text-secondary leading-relaxed mb-md">
        {{ task.description }}
      </p>

      <!-- PrimeNG Button with Tailwind classes -->
      <p-button
        label="Complete"
        icon="pi pi-check"
        class="w-full"
        (onClick)="onComplete()"
      />
    </p-card>
  `,
})
export class TaskCardComponent {}
```

### CSS Layer Ordering

```css
/* global.css */
@layer tailwind-base, primeng, tailwind-utilities;

@layer tailwind-base {
  @tailwind base;
}

@layer tailwind-utilities {
  @tailwind components;
  @tailwind utilities;
}

/* PrimeNG layer is auto-injected between */
```

## Component Usage Guidelines

### Use PrimeNG For:

- ✅ Calendar/Datepicker
- ✅ Dropdown/Select
- ✅ Dialog/Modal
- ✅ Toast notifications
- ✅ Drag & Drop (or Angular CDK as fallback)
- ✅ Data tables (future)
- ✅ Tree views (future)
- ✅ File upload (future)

### Use Tailwind + Custom Components For:

- ✅ Layout (grid, flexbox)
- ✅ Task cards
- ✅ Kanban columns
- ✅ Backlog sidebar
- ✅ Simple buttons (unless PrimeNG button is sufficient)
- ✅ Typography
- ✅ Spacing/margins
- ✅ Colors and backgrounds

## Dyslexia-Friendly Implementation

### Typography Classes

```css
/* utilities.css */
@layer utilities {
  .text-dyslexia {
    font-family: Verdana, 'Open Sans', sans-serif;
    font-size: 22px;
    line-height: 1.5;
    letter-spacing: 0.12em;
  }

  .text-dyslexia-lg {
    font-size: 26px;
  }

  .text-dyslexia-xl {
    font-size: 33px;
  }

  .reading-width {
    max-width: 45ch; /* 45-60 characters per line */
  }
}
```

### Usage in Templates

```html
<div class="text-dyslexia text-text-primary reading-width">
  <p class="leading-relaxed tracking-wide">
    Task description with dyslexia-friendly formatting
  </p>
</div>
```

## Dark Mode Implementation

### Theme Toggle Service

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDarkMode = signal(false);

  toggleTheme() {
    this.isDarkMode.update((dark) => !dark);
    this.applyTheme();
  }

  private applyTheme() {
    const root = document.documentElement;
    if (this.isDarkMode()) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }
}
```

## Consequences

### Positive

- ✅ Fast development with pre-built components
- ✅ Full control over styling with Tailwind
- ✅ Consistent design system via configuration
- ✅ Accessibility built-in (PrimeNG)
- ✅ Small bundle (tree-shaking + JIT)
- ✅ Easy theme customization
- ✅ Dark mode support

### Negative

- ⚠️ Two styling systems to learn (manageable)
- ⚠️ CSS layer conflicts possible (mitigated with layers)
- ⚠️ PrimeNG + Tailwind bundle slightly larger than pure Tailwind
- ⚠️ Must maintain both configurations (design tokens)

### Risks & Mitigations

| Risk                     | Mitigation                           |
| ------------------------ | ------------------------------------ |
| Style conflicts          | Use CSS layers, test thoroughly      |
| Bundle size              | Tree-shake unused PrimeNG components |
| PrimeNG breaking changes | Pin versions, test before upgrading  |
| Over-reliance on PrimeNG | Use only for complex components      |

## Alternatives Considered

### Pure Tailwind + Headless UI

**Pros:** Full control, tiny bundle
**Cons:** Must build everything (datepicker, dropdown, etc.)
**Verdict:** Too much work for v0.1

### Angular Material + Custom CSS

**Pros:** Official Angular library
**Cons:** Material Design aesthetic, less flexible theming
**Verdict:** Design doesn't match our needs

### PrimeNG Only (No Tailwind)

**Pros:** Consistent theme, one system
**Cons:** Less flexible for custom styling, slower custom components
**Verdict:** Not enough control for dyslexia-friendly design

### Bootstrap + ng-bootstrap

**Pros:** Familiar, comprehensive
**Cons:** jQuery patterns, dated, harder to customize
**Verdict:** Not modern enough

## Performance Optimization

### Tree-Shaking PrimeNG

```typescript
// Only import components we use
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
// Don't import PrimeNG module (imports everything)
```

### Tailwind JIT Mode

```javascript
// tailwind.config.js
module.exports = {
  mode: 'jit', // Just-in-time mode
  purge: ['./src/**/*.{html,ts}'], // Remove unused CSS
  // ...
};
```

## References

- [PrimeNG Documentation](https://primeng.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [PrimeNG + Tailwind Integration](https://primeng.org/tailwind)
- [Dyslexia Style Guide](https://www.bdadyslexia.org.uk/advice/employers/creating-a-dyslexia-friendly-workplace/dyslexia-friendly-style-guide)

## Review Schedule

- **v0.2:** Evaluate component performance and bundle size
- **v0.4:** Assess if theming meets dark mode requirements
- **v1.0:** Full accessibility audit

---

**Decision Owner:** George
**Reviewed By:** N/A (solo project)
**Next Review:** v0.4 (after polish phase)
