import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService } from 'primeng/api';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';
import { appRoutes } from './app.routes';

const TaskerPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{purple.50}',
      100: '{purple.100}',
      200: '{purple.200}',
      300: '{purple.300}',
      400: '{purple.400}',
      500: '#8B7BB8',
      600: '{purple.600}',
      700: '{purple.700}',
      800: '{purple.800}',
      900: '{purple.900}',
      950: '{purple.950}'
    },
    colorScheme: {
      light: {
        primary: {
          color: '#8B7BB8',
          contrastColor: '#ffffff',
          hoverColor: '#7A6AA7',
          activeColor: '#6B5996'
        },
        surface: {
          0: '#ffffff',
          50: '#FAF9F7',
          100: '#F5F3F0',
          200: '#E8E6E3',
          300: '#D4D2CF',
          400: '#B5B3B0',
          500: '#979593',
          600: '#7A7876',
          700: '#5D5B59',
          800: '#403E3C',
          900: '#2B2B2A',
          950: '#1A1A19'
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),
    providePrimeNG({
      theme: {
        preset: TaskerPreset,
        options: {
          darkModeSelector: false,
          cssLayer: false
        }
      },
      ripple: true
    }),
    ConfirmationService
  ],
};
