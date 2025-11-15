import { Route } from '@angular/router';
import { SettingsComponent } from './components/settings/settings.component';

export const appRoutes: Route[] = [
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];
