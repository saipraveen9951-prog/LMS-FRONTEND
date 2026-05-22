import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([{ path: '', loadComponent: () => import('./analytics.component').then(m => m.AnalyticsComponent) }])],
  declarations: []
})
export class AnalyticsModule {}
