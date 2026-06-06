import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LmsApiService } from '../../core/services/lms-api.service';
import { Course, CourseModule, Quiz, QuizOption, QuizQuestion } from '../../models/api.models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-builder.component.html'
})
export class QuizBuilderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(LmsApiService);

  error = '';
  message = '';
  courses: Course[] = [];
  modules: CourseModule[] = [];
  quizzes: Quiz[] = [];
  editingQuizId?: number;

  moduleForm = this.fb.group({
    courseId: [null as number | null, Validators.required],
    moduleId: [null as number | null, Validators.required]
  });

  quizForm = this.fb.group({
    courseModuleId: [null as number | null, Validators.required],
    title: ['', Validators.required],
    description: [''],
    passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
    questions: this.fb.array([this.createQuestion()])
  });

  ngOnInit(): void {
    this.loadCourses();
  }

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

  loadCourses(): void {
    this.api.getCourses().subscribe({
      next: courses => this.courses = courses,
      error: error => this.error = this.describeError(error)
    });
  }

  loadModules(): void {
    const courseId = Number(this.moduleForm.value.courseId);
    this.modules = [];
    this.quizzes = [];
    this.moduleForm.patchValue({ moduleId: null });
    this.quizForm.patchValue({ courseModuleId: null });
    this.cancelEdit(false);

    if (!courseId) {
      return;
    }

    this.error = '';
    this.api.getCourseModules(courseId).subscribe({
      next: modules => this.modules = modules,
      error: error => this.error = this.describeError(error)
    });
  }

  selectModule(): void {
    const moduleId = Number(this.moduleForm.value.moduleId);
    this.quizForm.patchValue({ courseModuleId: moduleId || null });
    this.cancelEdit(false);
    this.listQuizzes();
  }

  addQuestion(): void {
    this.questions.push(this.createQuestion());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  addOption(questionIndex: number): void {
    this.options(questionIndex).push(this.createOption());
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.options(questionIndex);
    if (options.length > 2) {
      options.removeAt(optionIndex);
    }
  }

  markCorrect(questionIndex: number, optionIndex: number): void {
    this.options(questionIndex).controls.forEach((option, index) => {
      option.patchValue({ correct: index === optionIndex });
    });
  }

  listQuizzes(): void {
    const moduleId = Number(this.moduleForm.value.moduleId);
    if (!moduleId) return;
    this.error = '';
    this.api.getQuizzesByModule(moduleId).subscribe({
      next: quizzes => this.quizzes = quizzes,
      error: error => this.error = this.describeError(error)
    });
  }

  submit(): void {
    const moduleId = Number(this.moduleForm.value.moduleId);
    this.quizForm.patchValue({ courseModuleId: moduleId || null });

    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const validationError = this.validatePayload(payload);
    if (validationError) {
      this.error = validationError;
      return;
    }

    this.error = '';
    const request = this.editingQuizId
      ? this.api.updateQuiz(this.editingQuizId, payload)
      : this.api.createQuiz(payload);

    request.subscribe({
      next: quiz => {
        this.message = `Quiz ${this.editingQuizId ? 'updated' : 'created'}: ${quiz.title || payload.title || 'Untitled quiz'}`;
        this.resetQuizForm();
        this.listQuizzes();
      },
      error: error => this.error = this.describeError(error)
    });
  }

  editQuiz(quiz: Quiz): void {
    if (!quiz.id) return;
    this.error = '';
    this.api.getQuiz(quiz.id).subscribe({
      next: detail => {
        this.editingQuizId = detail.id || quiz.id;
        this.patchQuizForm(detail);
      },
      error: error => this.error = this.describeError(error)
    });
  }

  deleteQuiz(quiz: Quiz): void {
    if (!quiz.id || !confirm(`Delete ${quiz.title || 'this quiz'}?`)) return;
    this.error = '';
    this.api.deleteQuiz(quiz.id).subscribe({
      next: () => {
        this.message = 'Quiz deleted.';
        if (this.editingQuizId === quiz.id) {
          this.resetQuizForm();
        }
        this.listQuizzes();
      },
      error: error => this.error = this.describeError(error)
    });
  }

  cancelEdit(clearMessage = true): void {
    this.editingQuizId = undefined;
    this.resetQuizForm(clearMessage);
  }

  private buildPayload(): Quiz {
    const value = this.quizForm.getRawValue();
    return {
      title: (value.title || '').trim(),
      description: (value.description || '').trim(),
      passingScore: Number(value.passingScore),
      courseModuleId: Number(value.courseModuleId),
      questions: (value.questions as QuizQuestion[]).map(question => ({
        text: (question.text || '').trim(),
        marks: Number(question.marks),
        options: (question.options || []).map(option => ({
          text: (option.text || '').trim(),
          correct: Boolean(option.correct)
        }))
      }))
    };
  }

  private validatePayload(payload: Quiz): string {
    if (!payload.courseModuleId) return 'Select a course module.';
    if (!payload.title) return 'Quiz title is required.';
    if (!Number.isFinite(payload.passingScore || NaN) || (payload.passingScore || 0) < 0 || (payload.passingScore || 0) > 100) {
      return 'Passing score must be between 0 and 100.';
    }
    if (!payload.questions?.length) return 'Quiz must have at least one question.';

    const invalidQuestion = payload.questions.find(question => {
      const options = question.options || [];
      const correctCount = options.filter(option => option.correct).length;
      const hasInvalidOption = options.some(option => !option.text);
      return !question.text || !question.marks || question.marks < 1 || options.length < 2 || correctCount !== 1 || hasInvalidOption;
    });

    if (invalidQuestion) {
      return 'Each question needs text, marks, at least two filled options, and exactly one correct option.';
    }
    return '';
  }

  moduleId(module: CourseModule): number | null {
    return module.id || module.moduleId || module.courseModuleId || null;
  }

  moduleTitle(module: CourseModule): string {
    return module.title || `Module ${this.moduleId(module) || ''}`.trim();
  }

  private patchQuizForm(quiz: Quiz): void {
    this.quizForm.patchValue({
      courseModuleId: quiz.courseModuleId || Number(this.moduleForm.value.moduleId),
      title: quiz.title || '',
      description: quiz.description || '',
      passingScore: quiz.passingScore || 70
    });

    this.questions.clear();
    const questions = quiz.questions?.length ? quiz.questions : [this.emptyQuestion()];
    questions.forEach(question => this.questions.push(this.createQuestionFromValue(question)));
  }

  private resetQuizForm(clearMessage = false): void {
    const moduleId = Number(this.moduleForm.value.moduleId);
    this.editingQuizId = undefined;
    this.quizForm.reset({
      courseModuleId: moduleId || null,
      title: '',
      description: '',
      passingScore: 70
    });
    this.questions.clear();
    this.questions.push(this.createQuestion());
    if (clearMessage) {
      this.message = '';
    }
  }

  private createQuestionFromValue(question: QuizQuestion): FormGroup {
    return this.fb.group({
      text: [question.text || '', Validators.required],
      marks: [question.marks || 1, [Validators.required, Validators.min(1)]],
      options: this.fb.array((question.options?.length ? question.options : this.emptyQuestion().options || []).map(option => this.createOptionFromValue(option)))
    });
  }

  private createOptionFromValue(option: QuizOption): FormGroup {
    return this.fb.group({
      text: [option.text || '', Validators.required],
      correct: [Boolean(option.correct)]
    });
  }

  private emptyQuestion(): QuizQuestion {
    return {
      text: '',
      marks: 1,
      options: [
        { text: '', correct: true },
        { text: '', correct: false }
      ]
    };
  }

  private describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      if (typeof body === 'string' && body.trim()) return body;
      if (body?.message) return body.message;
      if (body?.error) return body.error;
      if (body?.detail) return body.detail;
      return error.message;
    }
    return error instanceof Error ? error.message : 'Request failed.';
  }

}
