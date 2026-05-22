import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([{ path: '', loadComponent: () => import('./collaboration.component').then(m => m.CollaborationComponent) }])],
  declarations: []
})
export class CollaborationModule {}
