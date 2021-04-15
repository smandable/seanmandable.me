import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
})
export class ContactComponent implements OnInit {
  endpoint: string;

  form: FormGroup;
  name: FormControl = new FormControl('', [Validators.required]);
  email: FormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  message: FormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(256),
  ]);
  // name: FormControl = new FormControl('');
  // email: FormControl = new FormControl('');
  // message: FormControl = new FormControl('');

  honeypot: FormControl = new FormControl(''); // we will use this to prevent spam
  submitted: boolean = false; // show and hide the success message
  isLoading: boolean = false; // disable the submit button if we're loading
  responseMessage: string; // the response message to show to the user

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {
    this.form = this.formBuilder.group({
      name: this.name,
      email: this.email,
      message: this.message,
      honeypot: this.honeypot,
    });
  }

  ngOnInit() {
    this.endpoint = 'https://formspree.io/f/mjvjvadn';
  }

  onSubmit() {
    if (this.form.status == 'VALID' && this.honeypot.value == '') {
      this.form.disable(); // disable the form if it's valid to disable multiple submissions
      var formData: any = new FormData();
      formData.append('name', this.form.get('name').value);
      formData.append('email', this.form.get('email').value);
      formData.append('message', this.form.get('message').value);

      this.isLoading = true; // sending the post request async so it's in progress
      this.submitted = false; // hide the response message on multiple submits

      this.http.post(this.endpoint, formData).subscribe(
        (response) => {
          // choose the response message
          if (response['ok'] == true) {
            this.responseMessage =
              "Thanks for the message! I'll get back to you soon!";
          } else {
            this.responseMessage =
              'Oops! Something went wrong... Reload the page and try again.';
          }
          this.form.enable(); // re enable the form after a success
          this.form.reset({ name: '', email: '', message: '' }); //clear form fields
          this.submitted = true; // show the response message
          this.isLoading = false; // re enable the submit button
          //console.log(response);
        },
        (error) => {
          this.responseMessage =
            'Oops! An error occurred... Reload the page and try again.';
          this.form.enable(); // re enable the form after a success
          this.submitted = true; // show the response message
          this.isLoading = false; // re enable the submit button
          //console.log(error);
        }
      );
    }
  }
}
