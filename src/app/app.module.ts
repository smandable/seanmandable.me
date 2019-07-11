import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import bootstrap from "../../node_modules/bootstrap";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { ResumeComponent } from './resume/resume.component';
import { CoverLetterComponent } from './cover-letter/cover-letter.component';
import { QaComponent } from './qa/qa.component';
import { CodeSamplesComponent } from './code-samples/code-samples.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';
import { CallToActionComponent } from './call-to-action/call-to-action.component';



@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    AboutComponent,
    PortfolioComponent,
    ResumeComponent,
    CoverLetterComponent,
    QaComponent,
    CodeSamplesComponent,
    ContactComponent,
    FooterComponent,
    CallToActionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
