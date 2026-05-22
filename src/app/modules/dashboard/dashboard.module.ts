import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([{ path: '', loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent) }])],
  declarations: []
})
export class DashboardModule {}
