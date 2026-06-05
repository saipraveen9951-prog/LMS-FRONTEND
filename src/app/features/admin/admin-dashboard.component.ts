import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Course, DashboardSummary, Enrollment, User } from '../../models/api.models';
import { LmsApiService } from '../../core/services/lms-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);

  loading = false;
  error = '';
  message = '';
  summary?: DashboardSummary;
  employees: User[] = [];
  courses: Course[] = [];
  enrollments: Enrollment[] = [];
  assignForm = this.fb.group({
    employeeId: [null as number | null, Validators.required],
    courseId: [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.getAdminDashboard().subscribe({ next: data => this.summary = data, error: err => this.error = err.message });
    this.api.getEmployees().subscribe({ next: data => this.employees = data, error: err => this.error = err.message });
    this.api.getCourses().subscribe({
      next: data => {
        this.courses = data;
        if (data.length) {
          this.assignForm.patchValue({ courseId: data[0].id });
          this.loadEnrollments(data[0].id);
        }
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.error = err.message;
      }
    });
  }

  loadEnrollments(courseId: number): void {
    this.api.getCourseEnrollments(courseId).subscribe({ next: data => this.enrollments = data, error: err => this.error = err.message });
  }

  onCourseChange(value: string): void {
    this.loadEnrollments(Number(value));
  }

  assign(): void {
    if (this.assignForm.invalid) return;
    const value = this.assignForm.getRawValue();
    this.api.assignCourse({ employeeId: Number(value.employeeId), courseId: Number(value.courseId) }).subscribe({
      next: () => {
        this.message = 'Course assigned successfully.';
        this.loadEnrollments(Number(value.courseId));
      },
      error: err => this.error = err.message
    });
  }
}
