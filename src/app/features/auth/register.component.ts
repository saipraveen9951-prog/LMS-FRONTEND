import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LmsApiService } from '../../core/services/lms-api.service';
import { Department, Role } from '../../models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private api = inject(LmsApiService);
  private router = inject(Router);

  departments: Department[] = [];
  loading = false;
  error = '';
  message = '';

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: ['EMPLOYEE' as Role, Validators.required],
    departmentId: [null as number | null]
  });

  ngOnInit(): void {
    if (this.auth.getRole() === 'ADMIN') {
      this.api.getDepartments().subscribe({
        next: departments => this.departments = departments,
        error: error => this.error = error.message
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const value = this.form.getRawValue();
    this.auth.register({
      firstName: value.firstName || '',
      lastName: value.lastName || '',
      email: value.email || '',
      password: value.password || '',
      role: value.role || 'EMPLOYEE',
      departmentId: value.departmentId
    }).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Registration successful. Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 900);
      },
      error: error => {
        this.loading = false;
        this.error = error.message || 'Registration failed.';
      }
    });
  }
}
