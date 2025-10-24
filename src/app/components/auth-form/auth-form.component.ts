import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { LoginMethod } from '../../models/enumerators.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss'
})
export class AuthFormComponent {
  authForm!: FormGroup;
  mode: LoginMethod = LoginMethod.Register || LoginMethod.Login;
  LoginMethod = LoginMethod;
  selectedQuickUser = '';
  quickUsers: User[] = [];
  errMessage = "";

  // Паттерн пароля: Хотя бы 1 цифра, 1 Строчная и 1 Прописная буква
  private static passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/
  // Паттерн телефона: допустимый формат +7 111 111 11 11
  private static phonePattern = /^\+7[\s(]*\d{3}[\s)]*\d{3}[\s-]?\d{2}[\s-]?\d{2}$/
  // Паттерн почты: допустимый формат типа example@userhub.local
  private static emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

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
    });

    this.updateValidatorsForModes(this.mode);
  }

  private updateValidatorsForModes(mode: LoginMethod): void {
    const { username, password, email, phone, agreement, birthdate, usercredentials } = this.authForm.controls;

    email.clearValidators();
    phone.clearValidators();
    agreement.clearValidators();
    birthdate.clearValidators();
    usercredentials.clearValidators();

    if (mode === LoginMethod.Login) {
      username.setValidators([Validators.required]);
      password.setValidators([Validators.required, Validators.minLength(6)]);
    }
    else if (mode === LoginMethod.Register) {
      username.setValidators([Validators.required, Validators.minLength(4)]);
      password.setValidators([
        Validators.required, 
        Validators.minLength(6), 
        Validators.pattern(AuthFormComponent.passwordPattern)
      ]);
      email.setValidators([Validators.required, Validators.email]);
      phone.setValidators([Validators.required, Validators.pattern(AuthFormComponent.phonePattern)]);
      agreement.setValidators([Validators.requiredTrue]);
      birthdate.setValidators([]);
      usercredentials.setValidators([]);
    }
    else if (mode === LoginMethod.QuickLogin) {
      username.clearValidators();
      password.clearValidators();
    }

    Object.values(this.authForm.controls).forEach(ctrl => ctrl.updateValueAndValidity());
  }

  /** Переключатель режимов входа */
  toggleMode(target?: 'login' | 'register' | 'quick') {
    switch (target) {
      case 'login':
        this.mode = LoginMethod.Login;
        break;
      case 'register':
        this.mode = LoginMethod.Register;
        break;
      case 'quick':
        this.mode = LoginMethod.QuickLogin;
        this.userService.loadUsersFromFile().subscribe(users => this.quickUsers = users);
        break;
      default:
        this.mode = LoginMethod.Login;
    }

    this.errMessage = "";
    this.authForm.reset();
    this.updateValidatorsForModes(this.mode);
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.errMessage = "Пожалуйста, проверьте правильность заполнения формы и согласие!";
      this.authForm.markAllAsTouched();
      return;
    }

    const { username, password, email, phone } = this.authForm.value;

    if (this.mode === LoginMethod.Login) {
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

  onQuickLogin() {
    if (this.mode === LoginMethod.QuickLogin) {
      if (!this.selectedQuickUser) {
        this.errMessage = "Выберите пользователя для входа!";
        return;
      }
      this.userService.quickLogin(this.selectedQuickUser).subscribe(user => {
        if (user) {
          alert(`Вход выполнен как ${user.username} (${user.role})`);
          this.router.navigate(['/']);
        } else {
          this.errMessage = "Такого пользователя нет в данных JSON!";
        }
      });
    }
  }
}
