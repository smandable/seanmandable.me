import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  public isMenuCollapsed = true;

  constructor() {}

  ngOnInit(): void {}
}
