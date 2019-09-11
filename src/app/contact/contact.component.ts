import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  name: string;
  email: string;
  // company: string;
  // phone: string;
  message: string;
  endpoint: string;

  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  ngOnInit() {
     // this.endpoint = "http://localhost:8000/sendEmail.php";
    this.endpoint = 'http://www.seanmandable.me/sendEmail.php';
  }

  processForm() {
    // const allInfo = `My name is ${this.name}. My email is ${this.email}.
    // My company is ${this.company}. My phone is ${this.phone}. My message is ${this.message}`;
    //
    // console.log(allInfo);

    let postVars;

    postVars = {
      name: this.name,
      email: this.email,
      // company: this.company,
      // phone: this.phone,
      message: this.message
    };

    // You may also want to check the response. But again, let's keep it simple.
    this.http.post(this.endpoint, postVars)
      .subscribe(
        response => console.log(response),
        response => console.log(response)
      );
  }

}
