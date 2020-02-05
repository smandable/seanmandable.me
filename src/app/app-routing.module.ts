import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { HomeComponent } from './home/home.component';
// import { PortfolioComponent } from './portfolio/portfolio.component';
// import { ResumeComponent } from './resume/resume.component';
// import { CoverLetterComponent } from './cover-letter/cover-letter.component';
// import { QaComponent } from './qa/qa.component';
// import { CodeSamplesComponent } from './code-samples/code-samples.component';
// import { ContactComponent } from './contact/contact.component';

const routes: Routes = [
  // {path: 'home', component: HomeComponent},
  // {path: 'portfolio', component: PortfolioComponent},
  // {path: 'resume', component: ResumeComponent},
  // {path: 'cover-letter', component: CoverLetterComponent},
  // {path: 'qa', component: QaComponent},
  // {path: 'code-samples', component: CodeSamplesComponent},
  // {path: 'contact', component: ContactComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
