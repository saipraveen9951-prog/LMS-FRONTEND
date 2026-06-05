import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Department } from '../../models/api.models';
import { LmsApiService } from '../../core/services/lms-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './departments.component.html'
})
export class DepartmentsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);

  departments: Department[] = [];
  selected?: Department;
  error = '';
  message = '';
  form = this.fb.group({ name: ['', Validators.required], description: [''] });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getDepartments().subscribe({ next: data => this.departments = data, error: err => this.error = err.message });
  }

  edit(department: Department): void {
    this.selected = department;
    this.form.patchValue(department);
  }

  reset(): void {
    this.selected = undefined;
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const body = { name: value.name || '', description: value.description || '' };
    const request = this.selected ? this.api.updateDepartment(this.selected.id, body) : this.api.createDepartment(body);
    request.subscribe({ next: () => { this.message = 'Department saved.'; this.reset(); this.load(); }, error: err => this.error = err.message });
  }

  delete(department: Department): void {
    if (!confirm(`Delete ${department.name}?`)) return;
    this.api.deleteDepartment(department.id).subscribe({ next: () => this.load(), error: err => this.error = err.message });
  }
}
