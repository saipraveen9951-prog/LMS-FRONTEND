import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Enrollment, User } from '../../models/api.models';
import { LmsApiService } from '../../core/services/lms-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employee-dashboard.component.html'
})
export class EmployeeDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);

  profile?: User;
  enrollments: Enrollment[] = [];
  error = '';
  message = '';
  profileForm = this.fb.group({ firstName: ['', Validators.required], lastName: ['', Validators.required], departmentName: [''] });
  progressValues: Record<number, number> = {};

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getEmployeeProfile().subscribe({
      next: profile => {
        this.profile = profile;
        this.profileForm.patchValue({ firstName: profile.firstName, lastName: profile.lastName, departmentName: profile.departmentName || '' });
        this.api.getEmployeeEnrollments(profile.id).subscribe({
          next: rows => {
            this.enrollments = rows;
            this.progressValues = Object.fromEntries(rows.map(row => [row.id, row.completedModules]));
          },
          error: err => this.error = err.message
        });
      },
      error: err => this.error = err.message
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    const value = this.profileForm.getRawValue();
    this.api.updateEmployeeProfile({
      firstName: value.firstName || '',
      lastName: value.lastName || '',
      departmentName: value.departmentName || undefined,
      enabled: true
    }).subscribe({ next: () => { this.message = 'Profile updated.'; this.load(); }, error: err => this.error = err.message });
  }

  updateProgress(enrollment: Enrollment): void {
    this.api.updateProgress({ enrollmentId: enrollment.id, completedModules: Number(this.progressValues[enrollment.id]) }).subscribe({ next: () => { this.message = 'Progress updated.'; this.load(); }, error: err => this.error = err.message });
  }
}
