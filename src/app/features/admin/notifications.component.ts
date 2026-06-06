import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LmsApiService } from '../../core/services/lms-api.service';
import { NotificationRecord, NotificationRequest, NotificationStatus, NotificationType, Role } from '../../models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);

  error = '';
  message = '';
  history: NotificationRecord[] = [];
  statusFilter: '' | NotificationStatus = '';
  targetModes = [
    { value: 'single', label: 'Single email' },
    { value: 'multiple', label: 'Multiple emails' },
    { value: 'role', label: 'Role' },
    { value: 'all', label: 'All users' }
  ];
  types: NotificationType[] = ['ENROLLMENT', 'REMINDER', 'COMPLETION', 'CERTIFICATE'];
  roles: Role[] = ['ADMIN', 'TRAINER', 'EMPLOYEE'];

  form = this.fb.group({
    targetMode: ['single', Validators.required],
    recipientEmail: [''],
    recipientEmails: [''],
    role: ['EMPLOYEE' as Role],
    subject: ['', Validators.required],
    message: ['', Validators.required],
    type: ['REMINDER' as NotificationType, Validators.required],
  });

  ngOnInit(): void {
    this.loadHistory();
  }

  send(): void {
    this.error = '';
    this.message = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const validationError = this.validatePayload(payload);
    if (validationError) {
      this.error = validationError;
      return;
    }

    this.api.sendNotification(payload).subscribe({
      next: records => {
        this.message = `Notification created for ${records.length} recipient${records.length === 1 ? '' : 's'}.`;
        this.form.reset({ targetMode: 'single', role: 'EMPLOYEE', type: 'REMINDER' });
        this.loadHistory();
      },
      error: err => this.error = this.describeError(err)
    });
  }

  loadHistory(status: '' | NotificationStatus = this.statusFilter): void {
    this.statusFilter = status;
    this.api.getAdminNotifications(status || undefined).subscribe({
      next: records => this.history = records,
      error: err => this.error = this.describeError(err)
    });
  }

  body(record: NotificationRecord): string {
    return record.message || record.body || '';
  }

  private buildPayload(): NotificationRequest {
    const value = this.form.getRawValue();
    const payload: NotificationRequest = {
      subject: (value.subject || '').trim(),
      message: (value.message || '').trim(),
      type: value.type || 'REMINDER',
      emailEnabled: false
    };

    if (value.targetMode === 'single') {
      payload.recipientEmail = (value.recipientEmail || '').trim();
    } else if (value.targetMode === 'multiple') {
      payload.recipientEmails = (value.recipientEmails || '')
        .split(',')
        .map(email => email.trim())
        .filter(Boolean);
    } else if (value.targetMode === 'role') {
      payload.role = value.role || 'EMPLOYEE';
    } else {
      payload.sendToAll = true;
    }

    return payload;
  }

  private validatePayload(payload: NotificationRequest): string {
    if (!payload.subject) return 'Subject is required.';
    if (!payload.message) return 'Message is required.';
    if (payload.recipientEmail !== undefined && !payload.recipientEmail) return 'Recipient email is required.';
    if (payload.recipientEmails !== undefined && !payload.recipientEmails.length) return 'Enter at least one recipient email.';
    return '';
  }

  private describeError(error: unknown): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const body = (error as { error?: unknown; message?: string }).error;
      if (typeof body === 'string' && body.trim()) return body;
      if (body && typeof body === 'object' && 'message' in body) return String((body as { message?: string }).message);
      if ((error as { message?: string }).message) return String((error as { message?: string }).message);
    }
    return error instanceof Error ? error.message : 'Request failed.';
  }
}
