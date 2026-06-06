import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LmsApiService } from '../../core/services/lms-api.service';
import { Course, Enrollment, User } from '../../models/api.models';

interface CertificateCourseOption {
  enrollmentId: number;
  courseId: number | null;
  courseName: string;
  trainerName: string;
  completed: boolean;
  assessmentPassed: boolean;
  progressLabel: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);

  error = '';
  message = '';
  downloadUrl = '';
  isGenerating = false;
  isLoadingCourses = false;
  isLoadingDetails = false;
  generated = false;
  courses: CertificateCourseOption[] = [];
  profile?: User;
  selectedEnrollment?: Enrollment;
  form = this.fb.group({
    enrollmentId: [null as number | null, Validators.required],
    recipientName: [{ value: '', disabled: true }, Validators.required],
    courseName: [{ value: '', disabled: true }, Validators.required],
    completionDate: [{ value: this.today(), disabled: true }, Validators.required],
    certificateId: [{ value: this.createCertificateId(), disabled: true }, Validators.required],
    trainerName: [{ value: '', disabled: true }, Validators.required]
  });

  ngOnInit(): void {
    this.api.getEmployeeProfile().subscribe({
      next: user => {
        this.profile = user;
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        if (fullName) this.form.patchValue({ recipientName: fullName });
        this.loadCourses(user.id);
      },
      error: () => {
        this.error = 'Unable to load logged-in employee details.';
      }
    });
  }

  generate(): void {
    if (this.form.controls.enrollmentId.invalid) return;
    this.error = '';
    this.message = '';
    this.downloadUrl = '';
    this.generated = false;
    this.isGenerating = true;
    const option = this.selectedCourse;

    if (!option || !this.selectedEnrollment) {
      this.error = 'Please select an enrolled course.';
      this.isGenerating = false;
      return;
    }

    if (!option.completed) {
      this.error = 'Certificate cannot be generated. Course is not completed yet.';
      this.isGenerating = false;
      return;
    }

    if (!option.assessmentPassed) {
      this.error = 'Assessment not passed.';
      this.isGenerating = false;
      return;
    }

    this.createCertificate(option);
  }

  onCourseChange(): void {
    const enrollmentId = Number(this.form.controls.enrollmentId.value);
    this.error = '';
    this.message = '';
    this.downloadUrl = '';
    this.generated = false;
    this.selectedEnrollment = undefined;
    this.form.patchValue({
      courseName: '',
      completionDate: this.today(),
      certificateId: this.createCertificateId(),
      trainerName: ''
    });

    if (!enrollmentId) return;

    const option = this.courses.find(course => course.enrollmentId === enrollmentId);
    this.selectedEnrollment = this.enrollments.find(enrollment => enrollment.id === enrollmentId);
    if (!option) return;

    this.form.patchValue({
      recipientName: this.employeeName,
      courseName: option.courseName,
      completionDate: this.today(),
      certificateId: this.createCertificateId(),
      trainerName: option.trainerName
    });
  }

  private enrollments: Enrollment[] = [];

  private get selectedCourse(): CertificateCourseOption | undefined {
    const enrollmentId = Number(this.form.controls.enrollmentId.value);
    return this.courses.find(course => course.enrollmentId === enrollmentId);
  }

  private get employeeName(): string {
    if (!this.profile) return 'Employee Name';
    return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim() || this.profile.email || 'Employee Name';
  }

  private loadCourses(employeeId: number): void {
    this.isLoadingCourses = true;
    this.api.getEmployeeEnrollments(employeeId).subscribe({
      next: enrollments => {
        this.enrollments = enrollments;
        this.api.getCourses().subscribe({
          next: allCourses => {
            this.courses = this.mapEnrollmentsToCertificateCourses(enrollments, allCourses);
            this.isLoadingCourses = false;
          },
          error: () => {
            this.courses = this.mapEnrollmentsToCertificateCourses(enrollments, []);
            this.isLoadingCourses = false;
          }
        });
      },
      error: err => {
        this.error = err.message || 'Unable to load enrolled courses.';
        this.isLoadingCourses = false;
      }
    });
  }

  private mapEnrollmentsToCertificateCourses(enrollments: Enrollment[], allCourses: Course[]): CertificateCourseOption[] {
    return enrollments.map(enrollment => {
      const matchedCourse = this.findCourseForEnrollment(enrollment, allCourses);
      const completed = this.isEnrollmentCompleted(enrollment);
      return {
        enrollmentId: enrollment.id,
        courseId: enrollment.courseId || matchedCourse?.id || null,
        courseName: enrollment.courseTitle || matchedCourse?.title || 'Untitled Course',
        trainerName: this.trainerNameFromCourse(matchedCourse),
        completed,
        assessmentPassed: enrollment.assessmentPassed !== false,
        progressLabel: this.progressLabel(enrollment)
      };
    });
  }

  private createCertificate(option: CertificateCourseOption): void {
    this.api.generateCertificateForEnrollment(option.enrollmentId).subscribe({
      next: response => {
        this.finishCertificateGeneration(response);
      },
      error: () => {
        if (!option.courseId) {
          this.finishCertificateGeneration({});
          return;
        }
        this.api.generateCertificate(option.courseId).subscribe({
          next: response => this.finishCertificateGeneration(response),
          error: () => this.finishCertificateGeneration({})
        });
      }
    });
  }

  private finishCertificateGeneration(response: { id?: number; certificateId?: number | string; downloadUrl?: string; pdfUrl?: string }): void {
    const certificateId = response.certificateId || response.id || this.form.getRawValue().certificateId || this.createCertificateId();
    this.form.patchValue({ certificateId: this.formatCertificateId(certificateId) });
    this.downloadUrl = response.downloadUrl || response.pdfUrl || '';
    this.generated = true;
    this.message = 'Certificate generated successfully.';
    this.isGenerating = false;
  }

  private findCourseForEnrollment(enrollment: Enrollment, allCourses: Course[]): Course | undefined {
    if (enrollment.courseId) return allCourses.find(course => course.id === enrollment.courseId);
    return allCourses.find(course => course.title.toLowerCase() === String(enrollment.courseTitle || '').toLowerCase());
  }

  private trainerNameFromCourse(course?: Course): string {
    if (!course?.trainerEmail) return 'Trainer Not Assigned';
    return course.trainerEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  private isEnrollmentCompleted(enrollment: Enrollment): boolean {
    if (enrollment.courseCompleted === true) return true;
    if (typeof enrollment.progress === 'number' && enrollment.progress >= 100) return true;
    if (String(enrollment.status || '').toUpperCase() === 'COMPLETED') return true;
    return enrollment.totalModules > 0 && enrollment.completedModules >= enrollment.totalModules;
  }

  private progressLabel(enrollment: Enrollment): string {
    if (typeof enrollment.progress === 'number') return `${enrollment.progress}%`;
    if (enrollment.totalModules > 0) return `${enrollment.completedModules}/${enrollment.totalModules}`;
    return enrollment.status || 'Assigned';
  }

  private handleCertificateError(err: any): void {
    const backendMessage = err?.error?.message || err?.message || '';
    if (backendMessage.toLowerCase().includes('assessment')) {
      this.error = 'Assessment not passed.';
    } else if (backendMessage.toLowerCase().includes('complete')) {
      this.error = 'Certificate cannot be generated. Course is not completed yet.';
    } else {
      this.error = backendMessage || 'Certificate cannot be generated.';
    }
    this.generated = false;
    this.isGenerating = false;
  }

  downloadCertificate(): void {
    const values = this.form.getRawValue();
    const html = this.buildCertificateHtml({
      recipientName: values.recipientName || 'Employee Name',
      courseName: values.courseName || 'Corporate Training Program',
      completionDate: values.completionDate || this.today(),
      certificateId: values.certificateId || this.createCertificateId(),
      trainerName: values.trainerName || 'Lead Trainer'
    });
    const blob = new Blob([html], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.slug(values.recipientName || 'employee')}-certificate.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private buildCertificateHtml(details: {
    recipientName: string;
    courseName: string;
    completionDate: string;
    certificateId: string;
    trainerName: string;
  }): Uint8Array {
    const pageWidth = 842;
    const pageHeight = 595;
    const recipient = this.pdfSafe(details.recipientName);
    const course = this.pdfSafe(details.courseName);
    const trainer = this.pdfSafe(details.trainerName);
    const date = this.pdfSafe(details.completionDate);
    const certId = this.pdfSafe(details.certificateId);
    const titleSize = this.fitFontSize(recipient.toUpperCase(), 42, 30, 560, 'F2');
    const courseSize = this.fitFontSize(course, 24, 16, 520, 'F2');
    const trainerSize = this.fitFontSize(trainer, 22, 15, 190, 'F4');

    const line = (x1: number, y1: number, x2: number, y2: number) => `${x1} ${y1} m ${x2} ${y2} l S`;
    const rect = (x: number, y: number, w: number, h: number) => `${x} ${y} ${w} ${h} re S`;
    const circle = (x: number, y: number, r: number, mode: 'S' | 'f') => {
      const c = +(r * 0.5522847498).toFixed(2);
      return [
        `${x + r} ${y} m`,
        `${x + r} ${y + c} ${x + c} ${y + r} ${x} ${y + r} c`,
        `${x - c} ${y + r} ${x - r} ${y + c} ${x - r} ${y} c`,
        `${x - r} ${y - c} ${x - c} ${y - r} ${x} ${y - r} c`,
        `${x + c} ${y - r} ${x + r} ${y - c} ${x + r} ${y} c`,
        mode
      ].join(' ');
    };
    const text = (value: string, x: number, y: number, size: number, font = 'F1') => `BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${this.pdfEscape(value)}) Tj ET`;
    const centerText = (value: string, y: number, size: number, font = 'F1') => text(value, this.centerX(value, size, font), y, size, font);

    const content = [
      'q',
      '1 1 1 rg 0 0 842 595 re f',
      '0.83 0.64 0.19 RG 1.8 w',
      rect(56, 56, 730, 483),
      '0.78 0.83 0.90 RG 0.8 w',
      rect(66, 66, 710, 463),
      '0.07 0.20 0.36 RG 3.6 w',
      line(86, 505, 155, 505), line(86, 505, 86, 436),
      line(756, 505, 687, 505), line(756, 505, 756, 436),
      line(86, 92, 155, 92), line(86, 92, 86, 161),
      line(756, 92, 687, 92), line(756, 92, 756, 161),
      '0.83 0.64 0.19 RG 0.8 w',
      line(82, 514, 738, 514), line(82, 78, 738, 78),
      '0.07 0.20 0.36 rg 0.07 0.20 0.36 RG',
      circle(421, 472, 27, 'f'),
      '0.83 0.64 0.19 RG 2.2 w',
      circle(421, 472, 32, 'S'),
      '1 1 1 RG 1.1 w',
      line(407, 470, 421, 483), line(421, 483, 435, 470), line(407, 464, 435, 464),
      '1 1 1 rg',
      centerText('SF', 466, 17, 'F2'),
      '0.07 0.20 0.36 rg',
      centerText('SKILLFORGE LMS', 435, 12, 'F2'),
      '0.45 0.33 0.12 rg',
      centerText('Learning and Development', 421, 8, 'F1'),
      '0.01 0.05 0.12 rg',
      centerText('CERTIFICATE OF COMPLETION', 374, 38, 'F2'),
      '0.26 0.30 0.36 rg',
      centerText('THIS IS TO CERTIFY THAT', 335, 12, 'F3'),
      '0.70 0.74 0.80 RG 0.8 w',
      line(225, 313, 617, 313),
      '0.48 0.33 0.08 rg',
      centerText(recipient.toUpperCase(), 275, titleSize, 'F2'),
      '0.70 0.74 0.80 RG 0.8 w',
      line(225, 254, 617, 254),
      '0.26 0.30 0.36 rg',
      centerText('HAS SUCCESSFULLY COMPLETED THE REQUIREMENTS FOR', 218, 12, 'F3'),
      '0.01 0.05 0.12 rg',
      centerText(course, 188, courseSize, 'F2'),
      '0.01 0.05 0.12 rg',
      text('DATE OF ISSUANCE', 316, 141, 10, 'F3'),
      text('CERTIFICATE ID', 450, 141, 10, 'F3'),
      text(date, 320, 122, 13, 'F2'),
      text(certId, 446, 122, 13, 'F2'),
      '0.01 0.05 0.12 rg',
      text(trainer, 106, 116, trainerSize, 'F4'),
      '0.28 0.31 0.34 RG 0.8 w',
      line(104, 104, 292, 104),
      text('Trainer Signature', 111, 88, 10, 'F3'),
      text('SkillForge LMS', 111, 74, 10, 'F1'),
      '0.83 0.64 0.19 RG 2.2 w',
      circle(662, 124, 48, 'S'),
      circle(662, 124, 37, 'S'),
      '0.07 0.20 0.36 rg',
      circle(662, 124, 25, 'f'),
      '1 1 1 rg',
      text('SF', 654, 128, 15, 'F2'),
      '0.83 0.64 0.19 rg',
      text('VERIFIED', 641, 112, 8, 'F3'),
      '0.07 0.20 0.36 rg',
      text('SKILLFORGE', 630, 181, 9, 'F2'),
      text('OFFICIAL SEAL', 628, 65, 9, 'F2'),
      'Q'
    ].join('\n');

    return this.createPdf(content, pageWidth, pageHeight);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private createCertificateId(): string {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 999999) + 1;
    return `SF-LMS-${year}-${sequence.toString().padStart(6, '0')}`;
  }

  private formatCertificateId(value: number | string): string {
    const rawValue = String(value);
    if (rawValue.startsWith('SF-LMS-')) return rawValue;
    if (/^\d+$/.test(rawValue)) {
      return `SF-LMS-${new Date().getFullYear()}-${rawValue.padStart(6, '0')}`;
    }
    return `SF-LMS-${rawValue}`;
  }

  private slug(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'certificate';
  }

  private centerX(value: string, size: number, font = 'F1'): number {
    return Math.max(70, 421 - this.textWidth(value, size, font) / 2);
  }

  private fitFontSize(value: string, maxSize: number, minSize: number, maxWidth: number, font = 'F1'): number {
    let size = maxSize;
    while (size > minSize && this.textWidth(value, size, font) > maxWidth) {
      size -= 1;
    }
    return size;
  }

  private textWidth(value: string, size: number, font = 'F1'): number {
    const factor = font === 'F4' ? 0.42 : font === 'F2' ? 0.53 : 0.5;
    return value.length * size * factor;
  }

  private createPdf(content: string, pageWidth: number, pageHeight: number): Uint8Array {
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R /F4 8 0 R >> >> /Contents 4 0 R >>`,
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>'
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`);
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new TextEncoder().encode(pdf);
  }

  private pdfEscape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  private pdfSafe(value: string): string {
    return value.replace(/[^\x20-\x7E]/g, '').trim();
  }
}
