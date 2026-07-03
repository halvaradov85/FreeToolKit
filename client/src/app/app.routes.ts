import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'tools',
    loadComponent: () => import('./catalog/catalog.component').then((m) => m.CatalogComponent),
  },
  {
    path: 'tools/:id',
    loadComponent: () => import('./tools/tool-page.component').then((m) => m.ToolPageComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./account/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./account/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./account/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'billing/upgrade',
    loadComponent: () => import('./billing/upgrade.component').then((m) => m.UpgradeComponent),
  },
  {
    path: 'billing/confirm',
    canActivate: [authGuard],
    loadComponent: () => import('./billing/confirm.component').then((m) => m.ConfirmComponent),
  },
  {
    path: 'contacto',
    loadComponent: () => import('./shared/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/admin.component').then((m) => m.AdminComponent),
  },
  { path: '**', redirectTo: '' },
];
