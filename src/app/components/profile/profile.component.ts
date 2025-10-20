import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Theme } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { Game } from '../../models/game.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  profileForm!: FormGroup;
  usergames: Game[] = [];
  currentTheme: Theme = Theme.Light
  Theme = Theme;

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) { }

  ngOnInit() {
    const user = this.userService.user;
    if (!user) {
      this.router.navigate(['/auth']);
      return;
    }

    this.profileForm = this.fb.group({
      username: [ { value: user.username, disabled: true } ],
      datebirth: [user.datebirth],
      credentials: [user.user_credentials],
      email: [user.email, [Validators.required, Validators.email]],
      phone: [user.phone, [Validators.required, Validators.pattern(/^\+7\d{10}$/)]],
      password: ['', [Validators.minLength(6)]]
    });

    this.userService.balance$.subscribe(() => {}); // для реактивного обновления в непрерывном состоянии
    this.userService.purchases$.subscribe(purchases => this.usergames = purchases);
    this.userService.theme$.subscribe(theme => this.currentTheme = theme);
  }

  /** Сохранение изменении */
  saveChanges() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { email, phone, password } = this.profileForm.getRawValue();
    const updatedData: any = { email, phone };

    if (password) updatedData.password = password;

    this.userService.updateProfile(updatedData);
    alert('Изменения успешно сохранены!');
  }

  /** Пополнение баланса (на фикс. сумму 500+)*/
  addFunds() {
    const balance = this.userService.getBalance();
    const newBalance = balance + 500;
    this.userService['balanceSource'].next(newBalance);

    const user = this.userService.user;
    if (user) {
      user.balance = newBalance;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  /** Получение баланса пользователя (для шаблонов html) */
  profileBalanceCheck() { return this.userService.getBalance() }

  /** Смена темы */
  switchTheme(theme: Theme) { this.userService.setTheme(theme); }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }
}
