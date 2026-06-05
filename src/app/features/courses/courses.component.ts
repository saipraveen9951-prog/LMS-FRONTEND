import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LmsApiService } from '../../core/services/lms-api.service';
import { Course, CourseModule, User } from '../../models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './courses.component.html'
})
export class CoursesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);
  public auth = inject(AuthService);

  courses: Course[] = [];
  trainers: User[] = [];
  modules: Record<number, CourseModule[]> = {};
  selected?: Course;
  error = '';
  message = '';
  courseForm = this.fb.group({ title: ['', Validators.required], description: [''], trainerEmail: [''] });
  moduleForm = this.fb.group({ courseId: [null as number | null, Validators.required], title: ['', Validators.required], description: [''], sequenceOrder: [1, Validators.required] });

  ngOnInit(): void { this.load(); }

  get isAdmin(): boolean { return this.auth.getRole() === 'ADMIN'; }

  load(): void {
    this.api.getCourses().subscribe({ next: data => this.courses = data, error: err => this.error = err.message });
    if (this.isAdmin) {
      this.api.getTrainers().subscribe({ next: data => this.trainers = data, error: err => this.error = err.message });
    }
  }

  edit(course: Course): void {
    this.selected = course;
    this.courseForm.patchValue({ title: course.title, description: course.description || '', trainerEmail: course.trainerEmail || '' });
  }

  clear(): void {
    this.selected = undefined;
    this.courseForm.reset();
  }

  saveCourse(): void {
    if (!this.isAdmin || this.courseForm.invalid) return;
    const value = this.courseForm.getRawValue();
    const body = { title: value.title || '', description: value.description || '', trainerEmail: value.trainerEmail || undefined };
    const request = this.selected ? this.api.updateCourse(this.selected.id, body) : this.api.createCourse(body);
    request.subscribe({ next: () => { this.message = 'Course saved.'; this.clear(); this.load(); }, error: err => this.error = err.message });
  }

  delete(course: Course): void {
    if (!this.isAdmin || !confirm(`Delete ${course.title}?`)) return;
    this.api.deleteCourse(course.id).subscribe({ next: () => this.load(), error: err => this.error = err.message });
  }

  loadModules(course: Course): void {
    this.api.getCourseModules(course.id).subscribe({ next: data => this.modules[course.id] = data, error: err => this.error = err.message });
  }

  addModule(): void {
    if (!this.isAdmin || this.moduleForm.invalid) return;
    const value = this.moduleForm.getRawValue();
    this.api.addCourseModule(Number(value.courseId), {
      title: value.title || '',
      description: value.description || '',
      sequenceOrder: Number(value.sequenceOrder)
    }).subscribe({ next: () => { this.message = 'Module added.'; this.moduleForm.reset({ sequenceOrder: 1 }); }, error: err => this.error = err.message });
  }
}
