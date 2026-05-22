import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-legacy-redirect',
  template: ''
})
export class LegacyRedirectComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const page = this.route.snapshot.data['page'] || 'index.html';
    window.location.replace(`/assets/legacy-static/${page}`);
  }
}
