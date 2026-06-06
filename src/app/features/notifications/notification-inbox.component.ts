import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { LmsApiService } from '../../core/services/lms-api.service';
import { NotificationRecord, NotificationSummary } from '../../models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-inbox.component.html'
})
export class NotificationInboxComponent implements OnInit {
  private api = inject(LmsApiService);

  error = '';
  notifications: NotificationRecord[] = [];
  summary: NotificationSummary = { total: 0, unread: 0 };
  unreadOnly = false;

  ngOnInit(): void {
    this.load();
  }

  load(unreadOnly = this.unreadOnly): void {
    this.unreadOnly = unreadOnly;
    this.error = '';
    this.api.getNotifications(unreadOnly).subscribe({
      next: notifications => this.notifications = notifications,
      error: error => this.error = this.describeError(error)
    });
    this.loadSummary();
  }

  markRead(item: NotificationRecord): void {
    if (item.read) return;
    this.api.markNotificationRead(item.id).subscribe({
      next: updated => {
        item.read = updated.read;
        item.readAt = updated.readAt;
        this.loadSummary();
      },
      error: error => this.error = this.describeError(error)
    });
  }

  markAllRead(): void {
    this.api.markAllNotificationsRead().subscribe({
      next: () => this.load(this.unreadOnly),
      error: error => this.error = this.describeError(error)
    });
  }

  body(item: NotificationRecord): string {
    return item.message || item.body || '';
  }

  private loadSummary(): void {
    this.api.getNotificationSummary().subscribe({
      next: summary => this.summary = summary,
      error: error => this.error = this.describeError(error)
    });
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
