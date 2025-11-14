import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  // TODO: Re-enable settings route after updating to PrimeNG v20 tabs API
  // {
  //   path: 'settings',
  //   loadComponent: () => import('./components/settings/settings.component')
  //     .then(m => m.SettingsComponent)
  // }
];
