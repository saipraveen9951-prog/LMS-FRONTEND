import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LmsApiService } from '../../core/services/lms-api.service';
import { Quiz, QuizQuestion } from '../../models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-builder.component.html'
})
export class QuizBuilderComponent {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);

  error = '';
  message = '';
  quizzes: Quiz[] = [];

  lookupForm = this.fb.group({
    moduleId: [null as number | null, Validators.required]
  });

  quizForm = this.fb.group({
    courseModuleId: [null as number | null, Validators.required],
    title: ['', Validators.required],
    description: [''],
    passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
    questions: this.fb.array([this.createQuestion()])
  });

  get questions(): FormArray<FormGroup> {
    return this.quizForm.controls.questions as FormArray<FormGroup>;
  }

  options(questionIndex: number): FormArray<FormGroup> {
    return this.questions.at(questionIndex).get('options') as FormArray<FormGroup>;
  }

  createQuestion(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      marks: [1, [Validators.required, Validators.min(1)]],
      options: this.fb.array([
        this.createOption(),
        this.createOption(),
        this.createOption(),
        this.createOption()
      ])
    });
  }

  createOption(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      correct: [false]
    });
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  markCorrect(questionIndex: number, optionIndex: number): void {
    this.options(questionIndex).controls.forEach((option, index) => {
      option.patchValue({ correct: index === optionIndex });
    });
  }

  listQuizzes(): void {
    if (this.lookupForm.invalid) return;
    this.error = '';
    this.api.getQuizzesByModule(Number(this.lookupForm.value.moduleId)).subscribe({
      next: quizzes => this.quizzes = quizzes,
      error: error => this.error = error.message
    });
  }

  submit(): void {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }

    const value = this.quizForm.getRawValue();
    const questions = value.questions as QuizQuestion[];
    const hasCorrectAnswers = questions.every(question => (question.options || []).some(option => option.correct));
    if (!hasCorrectAnswers) {
      this.error = 'Each question must have one correct option.';
      return;
    }

    this.error = '';
    this.api.createQuiz({ ...value, questions } as Quiz).subscribe({
      next: quiz => {
        this.message = `Quiz created: ${quiz.title || 'Untitled quiz'}`;
        this.quizForm.reset({ passingScore: 70 });
        this.questions.clear();
        this.questions.push(this.createQuestion());
      },
      error: error => this.error = error.message
    });
  }
}
