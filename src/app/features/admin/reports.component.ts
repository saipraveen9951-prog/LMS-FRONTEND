import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LmsApiService } from '../../core/services/lms-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.component.html'
})
export class ReportsComponent {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);

  error = '';
  report: unknown;
  form = this.fb.group({ employeeId: [null as number | null, Validators.required] });

  employeeReport(): void {
    if (this.form.invalid) return;
    this.api.getEmployeeReport(Number(this.form.value.employeeId)).subscribe({ next: data => this.report = data, error: err => this.error = err.message });
  }

  departmentReports(): void {
    this.api.getDepartmentReports().subscribe({ next: data => this.report = data, error: err => this.error = err.message });
  }

  completionReports(): void {
    this.api.getCourseCompletionReports().subscribe({ next: data => this.report = data, error: err => this.error = err.message });
  }

  asJson(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }
}
