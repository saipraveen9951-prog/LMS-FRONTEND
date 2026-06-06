import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell.component';

const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', loadComponent: () => import('./features/home/home-redirect.component').then(m => m.HomeRedirectComponent) },
      { path: 'admin', canActivate: [AuthGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'admin/users', canActivate: [AuthGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/admin/users.component').then(m => m.UsersComponent) },
      { path: 'admin/departments', canActivate: [AuthGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/admin/departments.component').then(m => m.DepartmentsComponent) },
      { path: 'admin/notifications', canActivate: [AuthGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/admin/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'admin/reports', canActivate: [AuthGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/admin/reports.component').then(m => m.ReportsComponent) },
      { path: 'courses', loadComponent: () => import('./features/courses/courses.component').then(m => m.CoursesComponent) },
      { path: 'trainer/upload', canActivate: [AuthGuard], data: { roles: ['TRAINER'] }, loadComponent: () => import('./features/trainer/upload.component').then(m => m.UploadComponent) },
      { path: 'trainer/assessments', canActivate: [AuthGuard], data: { roles: ['ADMIN', 'TRAINER'] }, loadComponent: () => import('./features/trainer/quiz-builder.component').then(m => m.QuizBuilderComponent) },
      { path: 'notifications', canActivate: [AuthGuard], data: { roles: ['ADMIN', 'TRAINER', 'EMPLOYEE'] }, loadComponent: () => import('./features/notifications/notification-inbox.component').then(m => m.NotificationInboxComponent) },
      { path: 'employee', canActivate: [AuthGuard], data: { roles: ['EMPLOYEE'] }, loadComponent: () => import('./features/employee/employee-dashboard.component').then(m => m.EmployeeDashboardComponent) },
      { path: 'assessments', canActivate: [AuthGuard], data: { roles: ['EMPLOYEE'] }, loadComponent: () => import('./features/employee/assessment.component').then(m => m.AssessmentComponent) },
      { path: 'certificates', canActivate: [AuthGuard], data: { roles: ['EMPLOYEE'] }, loadComponent: () => import('./features/employee/certificates.component').then(m => m.CertificatesComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
