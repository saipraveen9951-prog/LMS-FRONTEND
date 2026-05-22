# SkillForge LMS Frontend

Angular frontend for SkillForge LMS.

## Correct Project Folder

Run all frontend commands from this folder:

```powershell
cd "C:\Users\Ananda (Angular)\Downloads\skillforge-lms-frontend-20260522T045712Z-3-001\skillforge-lms-frontend\frontend-angular"
```

This is the folder that contains `package.json`, `angular.json`, and `src`.

## Run With Java Backend

Start the Java backend first and make sure it is listening on:

```text
http://localhost:8080
```

Then start Angular:

```powershell
npm start
```

Open the frontend at:

```text
http://localhost:4300
```

API calls made to `/api/...` are proxied to:

```text
http://localhost:8080/api/...
```

## Structure

```text
frontend-angular/
  angular.json
  package.json
  proxy.conf.json
  src/
    app/
      core/
      modules/
      shared/
    assets/
      legacy-static/
    environments/
```

`src/assets/legacy-static` contains the old standalone HTML/CSS/JS files for reference. The active Angular app runs from `src/app`.
