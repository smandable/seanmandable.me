import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;

  constructor() { }

  ngOnInit() { }

  processForm() {
    const allInfo = `My name is ${this.name}. My email is ${this.email}. My company is ${this.company}. My phone is ${this.phone}. My message is ${this.message}`;
    console.log(allInfo);
  }

}
