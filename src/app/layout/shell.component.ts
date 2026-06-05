import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Role } from '../models/api.models';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  constructor(public auth: AuthService, private router: Router) {}

  get role(): Role | null {
    return this.auth.getRole();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
