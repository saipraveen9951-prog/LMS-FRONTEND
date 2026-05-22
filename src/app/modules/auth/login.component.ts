import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-login',
  template: `
    <div class="container mt-5">
      <h2>Login</h2>
      <form>
        <div class="mb-3"><input class="form-control" placeholder="Email" /></div>
        <div class="mb-3"><input class="form-control" placeholder="Password" type="password" /></div>
        <button class="btn btn-primary">Login</button>
      </form>
    </div>
  `
})
export class LoginComponent {}
