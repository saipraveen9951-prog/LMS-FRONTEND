import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LmsApiService } from '../../core/services/lms-api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html'
})
export class UploadComponent {
  error = '';
  message = '';
  selectedFile?: File;

  constructor(private api: LmsApiService) {}

  chooseFile(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.[0];
  }

  upload(): void {
    if (!this.selectedFile) {
      this.error = 'Select a file first.';
      return;
    }
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.api.uploadTrainerModule(formData).subscribe({ next: () => this.message = 'File uploaded.', error: err => this.error = err.message });
  }
}
