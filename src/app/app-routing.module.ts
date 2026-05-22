import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'index.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'index.html' } },
  { path: 'login.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'login.html' } },
  { path: 'register.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'register.html' } },
  { path: 'admin-dashboard.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'admin-dashboard.html' } },
  { path: 'employee-dashboard.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'employee-dashboard.html' } },
  { path: 'courses.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'courses.html' } },
  { path: 'users.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'users.html' } },
  { path: 'departments.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'departments.html' } },
  { path: 'upload.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'upload.html' } },
  { path: 'notifications.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'notifications.html' } },
  { path: 'reports.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'reports.html' } },
  { path: 'assessments.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'assessments.html' } },
  { path: 'certificates.html', loadComponent: () => import('./legacy-redirect.component').then(m => m.LegacyRedirectComponent), data: { page: 'certificates.html' } },
  { path: '', loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
  { path: 'courses', loadChildren: () => import('./modules/courses/courses.module').then(m => m.CoursesModule) },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
