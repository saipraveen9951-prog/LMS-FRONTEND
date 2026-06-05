import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Department, User } from '../../models/api.models';
import { LmsApiService } from '../../core/services/lms-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);

  error = '';
  message = '';
  employees: User[] = [];
  trainers: User[] = [];
  departments: Department[] = [];
  selected?: User;
  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    departmentName: [''],
    enabled: [true]
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.error = '';
    this.api.getEmployees().subscribe({ next: data => this.employees = data, error: err => this.error = err.message });
    this.api.getTrainers().subscribe({ next: data => this.trainers = data, error: err => this.error = err.message });
    this.api.getDepartments().subscribe({ next: data => this.departments = data, error: err => this.error = err.message });
  }

  edit(user: User): void {
    this.selected = user;
    this.form.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      departmentName: user.departmentName || '',
      enabled: user.enabled ?? true
    });
  }

  save(): void {
    if (!this.selected || this.form.invalid) return;
    const value = this.form.getRawValue();
    this.api.updateUser(this.selected.id, {
      firstName: value.firstName || '',
      lastName: value.lastName || '',
      departmentName: value.departmentName || undefined,
      enabled: !!value.enabled
    }).subscribe({
      next: () => {
        this.message = 'User updated.';
        this.selected = undefined;
        this.form.reset({ enabled: true });
        this.load();
      },
      error: err => this.error = err.message
    });
  }

  delete(user: User): void {
    if (!confirm(`Delete ${user.email}?`)) return;
    this.api.deleteUser(user.id).subscribe({ next: () => this.load(), error: err => this.error = err.message });
  }
}
