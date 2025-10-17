import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss'
})
export class AuthFormComponent {
  authForm!: FormGroup;
  mode: 'login' | 'register' = 'login';
  errMessage = "";

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.authForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      birthdate: ['', []],
      usercredentials: ['', []],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', []], // только по регистрации - активируется!
      phone: ['', []],
      agreement: [false, []]
    })
  }

  private static phonePattern = /^\+7\d{10}$/;
  private static emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    if (this.mode === 'register') {
      this.authForm.get('email')?.setValidators([Validators.required, Validators.pattern(AuthFormComponent.emailPattern)]);
      this.authForm.get('phone')?.setValidators([Validators.required, Validators.pattern(AuthFormComponent.phonePattern)]);
      this.authForm.get('agreement')?.setValidators([Validators.requiredTrue]);
    } else {
      this.authForm.get('email')?.clearValidators();
      this.authForm.get('phone')?.clearValidators();
      this.authForm.get('agreement')?.clearValidators();
    }
    this.authForm.get('email')?.updateValueAndValidity();
    this.authForm.get('phone')?.updateValueAndValidity();
    this.authForm.get('agreement')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.errMessage = "Пожалуйста, проверьте правильность заполнения формы и согласие!";
      this.authForm.markAllAsTouched();
      return;
    }

    const { username, password, email, phone } = this.authForm.value;

    if (this.mode === 'login') {
      this.userService.login(username, password).subscribe(user => {
        if (user) this.router.navigate(['/']);
        else this.errMessage = "Данные введены неверно!";
      });
    } else {
      this.userService.register(username, password, email, phone).subscribe(user => {
        if (user) this.router.navigate(['/']);
        else this.errMessage = "Ошибка при регистрации пользователя!";
      });
    }
  }
}
