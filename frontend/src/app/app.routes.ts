import { Route } from '@angular/router';
// import { SettingsComponent } from './components/settings/settings.component';

export const appRoutes: Route[] = [
  // TODO: Re-enable settings route after updating to PrimeNG v20 tabs API
  // {
  //   path: 'settings',
  //   component: SettingsComponent
  // },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];
