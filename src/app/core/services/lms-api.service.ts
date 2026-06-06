import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CertificateCourseOption, CertificateDetails, CertificateGenerationResponse, Course, CourseModule, DashboardSummary, Department, Enrollment, NotificationRecord, NotificationRequest, NotificationStatus, NotificationSummary, Quiz, QuizSubmissionResult, User } from '../../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class LmsApiService {
  constructor(private api: ApiService) {}

  getAdminDashboard(): Observable<DashboardSummary> { return this.api.get('admin/dashboard'); }
  getEmployees(): Observable<User[]> { return this.api.get('admin/employees'); }
  getTrainers(): Observable<User[]> { return this.api.get('admin/trainers'); }
  updateUser(id: number, body: Partial<User>): Observable<User> { return this.api.put(`admin/users/${id}`, body); }
  deleteUser(id: number): Observable<void> { return this.api.delete(`admin/users/${id}`); }

  getDepartments(): Observable<Department[]> { return this.api.get('admin/departments'); }
  createDepartment(body: Partial<Department>): Observable<Department> { return this.api.post('admin/departments', body); }
  updateDepartment(id: number, body: Partial<Department>): Observable<Department> { return this.api.put(`admin/departments/${id}`, body); }
  deleteDepartment(id: number): Observable<void> { return this.api.delete(`admin/departments/${id}`); }

  getCourses(): Observable<Course[]> { return this.api.get('courses'); }
  createCourse(body: Partial<Course>): Observable<Course> { return this.api.post('admin/courses', body); }
  updateCourse(id: number, body: Partial<Course>): Observable<Course> { return this.api.put(`admin/courses/${id}`, body); }
  deleteCourse(id: number): Observable<void> { return this.api.delete(`admin/courses/${id}`); }
  getCourseModules(courseId: number): Observable<CourseModule[]> { return this.api.get(`courses/${courseId}/modules`); }
  addCourseModule(courseId: number, body: CourseModule): Observable<CourseModule> { return this.api.post(`admin/courses/${courseId}/modules`, body); }
  getCourseEnrollments(courseId: number): Observable<Enrollment[]> { return this.api.get(`courses/${courseId}/enrollments`); }
  assignCourse(body: { employeeId: number; courseId: number }): Observable<Enrollment> { return this.api.post('admin/enrollments', body); }

  getEmployeeProfile(): Observable<User> { return this.api.get('employee/profile'); }
  updateEmployeeProfile(body: Partial<User>): Observable<User> { return this.api.put('employee/profile', body); }
  getEmployeeEnrollments(employeeId: number): Observable<Enrollment[]> { return this.api.get(`employee/${employeeId}/enrollments`); }
  updateProgress(body: { enrollmentId: number; completedModules: number }): Observable<Enrollment> { return this.api.put('employee/enrollments/progress', body); }

  createQuiz(body: Quiz): Observable<Quiz> { return this.api.post('trainer/quizzes', body); }
  updateQuiz(id: number, body: Quiz): Observable<Quiz> { return this.api.put(`trainer/quizzes/${id}`, body); }
  deleteQuiz(id: number): Observable<void> { return this.api.delete(`trainer/quizzes/${id}`); }
  getQuizzesByModule(moduleId: number): Observable<Quiz[]> { return this.api.get(`trainer/modules/${moduleId}/quizzes`); }
  getQuiz(quizId: number): Observable<Quiz> { return this.api.get(`quizzes/detail/${quizId}`); }
  submitQuiz(body: { quizId: number; employeeEmail: string | null; answers: Record<number, number> }): Observable<QuizSubmissionResult> {
    return this.api.post('employee/quizzes/submissions', body);
  }

  getMyCertificateCourses(): Observable<CertificateCourseOption[]> {
    return this.api.get('certificates/my-courses');
  }

  getCertificateDetails(courseId: number): Observable<CertificateDetails> {
    return this.api.get(`certificates/course/${courseId}`);
  }

  generateCertificate(courseId: number): Observable<CertificateGenerationResponse> {
    return this.api.post('certificates/generate', { courseId });
  }

  generateCertificateForEnrollment(enrollmentId: number): Observable<CertificateGenerationResponse> {
    return this.api.post(`employee/certificates/generate/${enrollmentId}`, {});
  }

  sendNotification(body: NotificationRequest): Observable<NotificationRecord[]> {
    return this.api.post('admin/notifications/send', body);
  }

  getAdminNotifications(status?: NotificationStatus): Observable<NotificationRecord[]> {
    return this.api.get(status ? `admin/notifications?status=${status}` : 'admin/notifications');
  }

  getNotifications(unreadOnly = false): Observable<NotificationRecord[]> {
    return this.api.get(`notifications?unreadOnly=${unreadOnly}`);
  }

  getNotificationSummary(): Observable<NotificationSummary> {
    return this.api.get('notifications/summary');
  }

  markNotificationRead(id: number): Observable<NotificationRecord> {
    return this.api.patch(`notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<unknown> {
    return this.api.patch('notifications/read-all', {});
  }

  getEmployeeReport(employeeId: number): Observable<unknown> { return this.api.get(`admin/reports/employee/${employeeId}`); }
  getDepartmentReports(): Observable<unknown> { return this.api.get('admin/reports/departments'); }
  getCourseCompletionReports(): Observable<unknown> { return this.api.get('admin/reports/courses/completion'); }

  uploadTrainerModule(formData: FormData): Observable<unknown> {
    return this.api.upload('trainer/modules/upload', formData);
  }
}
