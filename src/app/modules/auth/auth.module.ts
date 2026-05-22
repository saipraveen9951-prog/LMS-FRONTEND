import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([
    { path: 'login', loadComponent: () => import('./login.component').then(m => m.LoginComponent) }
  ])],
  declarations: []
})
export class AuthModule {}
