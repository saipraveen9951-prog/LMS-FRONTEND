# SkillForge LMS Frontend

Simple Angular frontend for the Employee Learning Management System.

This frontend is backend-driven. It only contains screens for endpoints found in the existing backend-facing implementation:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/admin/dashboard`
- `GET /api/admin/employees`
- `GET /api/admin/trainers`
- `GET|POST|PUT|DELETE /api/admin/departments`
- `GET /api/courses`
- `POST|PUT|DELETE /api/admin/courses`
- `GET /api/courses/{courseId}/modules`
- `POST /api/admin/courses/{courseId}/modules`
- `POST /api/admin/enrollments`
- `GET /api/courses/{courseId}/enrollments`
- `GET|PUT /api/employee/profile`
- `GET /api/employee/{employeeId}/enrollments`
- `PUT /api/employee/enrollments/progress`
- `GET /api/quizzes/detail/{quizId}`
- `POST /api/trainer/quizzes`
- `GET /api/quizzes/{moduleId}`
- `POST /api/employee/quizzes/submissions`
- `POST /api/employee/certificates/generate/{enrollmentId}`
- `POST /api/trainer/modules/upload`
- Admin reports and notifications endpoints from the backend contract.

## Run

Start the Spring Boot backend on:

```text
http://localhost:8080
```

Then run Angular from this folder:

```powershell
npm run start
```

Open:

```text
http://localhost:4300
```

API requests go through `proxy.conf.json` from `/api` to `http://localhost:8080`.
