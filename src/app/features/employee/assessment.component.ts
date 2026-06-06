import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LmsApiService } from '../../core/services/lms-api.service';
import { Quiz, QuizSubmissionResult } from '../../models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './assessment.component.html'
})
export class AssessmentComponent {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);
  private auth = inject(AuthService);

  error = '';
  result?: QuizSubmissionResult;
  quizzes: Quiz[] = [];
  quiz?: Quiz;
  answers: Record<number, number> = {};
  moduleForm = this.fb.group({ moduleId: [null as number | null, Validators.required] });
  quizForm = this.fb.group({ quizId: [null as number | null, Validators.required] });

  loadQuizzes(): void {
    if (this.moduleForm.invalid) return;
    this.error = '';
    this.result = undefined;
    this.quiz = undefined;
    this.api.getQuizzesByModule(Number(this.moduleForm.value.moduleId)).subscribe({
      next: quizzes => this.quizzes = quizzes,
      error: err => this.error = err.message
    });
  }

  loadQuiz(quizId?: number): void {
    const id = quizId || Number(this.quizForm.value.quizId);
    if (!id) return;
    this.error = '';
    this.result = undefined;
    this.api.getQuiz(id).subscribe({
      next: quiz => {
        this.quiz = quiz;
        this.answers = {};
      },
      error: err => this.error = err.message
    });
  }

  submit(): void {
    if (!this.quiz) return;
    if (!this.quiz.id) {
      this.error = 'Load a quiz before submitting.';
      return;
    }
    const missingAnswer = (this.quiz.questions || []).some(question => question.id && !this.answers[question.id]);
    if (missingAnswer) {
      this.error = 'Answer all questions before submitting.';
      return;
    }
    this.error = '';
    this.api.submitQuiz({ quizId: this.quiz.id, employeeEmail: this.auth.getEmail(), answers: this.answers }).subscribe({
      next: res => this.result = res,
      error: err => this.error = err.message
    });
  }
}
