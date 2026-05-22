import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  template: ''
})
export class DashboardComponent implements OnInit {
  ngOnInit(): void {
    window.location.replace('/assets/legacy-static/index.html');
  }
}
