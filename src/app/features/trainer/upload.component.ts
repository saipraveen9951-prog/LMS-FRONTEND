import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LmsApiService } from '../../core/services/lms-api.service';
import { Course, CourseModule } from '../../models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload.component.html'
})
export class UploadComponent {
  private api = inject(LmsApiService);
  private fb = inject(FormBuilder);

  error = '';
  message = '';
  selectedFile?: File;
  courses: Course[] = [];
  modules: CourseModule[] = [];
  fileTypes = ['DOCUMENT', 'VIDEO', 'CERTIFICATE', 'ASSET', 'OTHER'];

  form = this.fb.group({
    courseId: [null as number | null, Validators.required],
    moduleId: [null as number | null, Validators.required],
    fileType: ['DOCUMENT']
  });

  constructor() {
    this.loadCourses();
  }

  chooseFile(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.[0];
  }

  loadCourses(): void {
    this.api.getCourses().subscribe({
      next: courses => this.courses = courses,
      error: error => this.error = error.message
    });
  }

  loadModules(): void {
    const courseId = Number(this.form.value.courseId);
    this.modules = [];
    this.form.patchValue({ moduleId: null });
    if (!courseId) {
      return;
    }

    this.error = '';
    this.api.getCourseModules(courseId).subscribe({
      next: modules => this.modules = modules,
      error: error => this.error = error.message
    });
  }

  upload(): void {
    this.message = '';
    this.error = '';
    if (!this.selectedFile) {
      this.error = 'Select a file first.';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Select a course module before uploading.';
      return;
    }

    const moduleId = Number(this.form.value.moduleId);
    if (!Number.isFinite(moduleId) || moduleId <= 0) {
      this.error = 'Module id must be a number.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('moduleId', String(moduleId));
    if (this.form.value.fileType) {
      formData.append('fileType', this.form.value.fileType);
    }

    this.api.uploadTrainerModule(formData).subscribe({
      next: () => this.message = 'File uploaded.',
      error: err => this.error = err.message
    });
  }
}
