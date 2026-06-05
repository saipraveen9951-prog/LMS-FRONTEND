import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  template: ''
})
export class HomeRedirectComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const role = this.auth.getRole();
    this.router.navigate([role === 'ADMIN' ? '/admin' : role === 'TRAINER' ? '/courses' : '/employee']);
  }
}
