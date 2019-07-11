import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
//
// @Component({
//   selector: 'child',
//   template: `
//     <ng-container>
//       here is child template that includes myTemplate
//     </ng-container>`
// })
// export class ChildComponent {
// }
//
//
// @Component({
//   selector: 'app-resume',
//   template: `
//     <p>Parent</p>
//     <child></child>
//   `
// })
// export class ResumeComponent {
// }
