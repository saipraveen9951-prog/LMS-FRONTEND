import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LmsApiService } from '../../core/services/lms-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);

  error = '';
  message = '';
  form = this.fb.group({ subject: ['', Validators.required], message: ['', Validators.required], role: [''] });

  send(): void {
    if (this.form.invalid) return;
    this.api.sendNotification(this.form.getRawValue() as { subject: string; message: string; role?: string }).subscribe({
      next: () => { this.message = 'Notification sent.'; this.form.reset(); },
      error: err => this.error = err.message
    });
  }
}
