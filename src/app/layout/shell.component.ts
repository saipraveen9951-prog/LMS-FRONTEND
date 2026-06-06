import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { LmsApiService } from '../core/services/lms-api.service';
import { NotificationRecord, NotificationSummary, Role } from '../models/api.models';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.component.html'
})
export class ShellComponent implements OnInit {
  notificationOpen = false;
  notificationSummary: NotificationSummary = { total: 0, unread: 0 };
  recentNotifications: NotificationRecord[] = [];

  constructor(public auth: AuthService, private router: Router, private api: LmsApiService) {}

  ngOnInit(): void {
    this.refreshNotifications();
  }

  get role(): Role | null {
    return this.auth.getRole();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleNotifications(): void {
    this.notificationOpen = !this.notificationOpen;
    if (this.notificationOpen) {
      this.refreshNotifications();
    }
  }

  refreshNotifications(): void {
    this.api.getNotificationSummary().subscribe({ next: summary => this.notificationSummary = summary });
    this.api.getNotifications(false).subscribe({ next: notifications => this.recentNotifications = notifications.slice(0, 5) });
  }

  markRead(item: NotificationRecord): void {
    if (item.read) return;
    this.api.markNotificationRead(item.id).subscribe({ next: () => this.refreshNotifications() });
  }

  markAllRead(): void {
    this.api.markAllNotificationsRead().subscribe({ next: () => this.refreshNotifications() });
  }

  notificationBody(item: NotificationRecord): string {
    return item.message || item.body || '';
  }
}
