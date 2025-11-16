import { Component, computed, inject } from '@angular/core';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ThemeService, type Theme } from '../../services/theme.service';

/**
 * Theme option interface for SelectButton
 */
interface ThemeOption {
  label: string;
  value: Theme;
  icon: string;
  ariaLabel: string;
}

/**
 * ThemeToggleComponent - Theme switcher using PrimeNG SelectButton
 *
 * Features:
 * - Signal-based reactive state
 * - Three modes: Light, Dark, Auto (system)
 * - Full accessibility support
 * - Zoneless-compatible
 *
 * @example
 * ```html
 * <app-theme-toggle />
 * ```
 */
@Component({
  selector: 'app-theme-toggle',
  imports: [SelectButton, FormsModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.css'
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  /**
   * Theme options for SelectButton
   */
  readonly themeOptions: ThemeOption[] = [
    {
      label: 'Light',
      value: 'light',
      icon: 'pi pi-sun',
      ariaLabel: 'Switch to light mode'
    },
    {
      label: 'Dark',
      value: 'dark',
      icon: 'pi pi-moon',
      ariaLabel: 'Switch to dark mode'
    },
    {
      label: 'Auto',
      value: 'auto',
      icon: 'pi pi-desktop',
      ariaLabel: 'Use system theme preference'
    }
  ];

  /**
   * Selected theme value from ThemeService
   * Direct signal reference for SelectButton binding
   */
  readonly selectedTheme = this.themeService.theme;

  /**
   * Handle theme selection change
   * Updates ThemeService when user selects new option
   */
  onThemeChange(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}
