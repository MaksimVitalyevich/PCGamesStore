import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Theme } from '../../models/enumerators.model';
import { UserService } from '../../services/user.service';
import { BalanceService } from '../../services/balance.service';
import { PurchaseService } from '../../services/purchase.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Game } from '../../models/game.model';
import { User } from '../../models/user.model';
import { purchaseFieldAnim, gameCardAnim, themeColorAnim } from '../../app.animations';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  animations: [purchaseFieldAnim, gameCardAnim, themeColorAnim]
})
export class ProfileComponent {
  profileForm!: FormGroup;
  user!: User;
  usergames: Game[] = [];
  currentTheme: Theme = Theme.Light
  hoveredCard: any = null;
  Theme = Theme;

  constructor(
    private fb: FormBuilder, 
    private userService: UserService, 
    private balanceService: BalanceService,
    private purchaseService: PurchaseService,
    private domSanitizer: DomSanitizer,
    private router: Router
  ) { }

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

    this.balanceService.balance$.subscribe(() => {}); // для реактивного обновления в непрерывном состоянии
    this.purchaseService.purchases$.subscribe(purchases => this.usergames = purchases);
    this.userService.theme$.subscribe(theme => this.currentTheme = theme);
  }

  /** Выбор фото (аватар) пользователя */
  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Недопустимый формат изображения!');
      return;
    }

    // Создание URL для предпросмотра
    const reader = new FileReader();
    reader.onload = () => {
      this.user.avatarURL = reader.result as string;
      this.userService.updateUserAvatar(this.user.avatarURL);
    };
    reader.readAsDataURL(file);
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
    this.balanceService.increase(500);
    alert('Ваш баланс успешно пополнен на 500 ₽!');
  }

  /** Получение баланса пользователя (для шаблонов html) */
  profileBalanceCheck() { return this.balanceService.balance } // Берем из свойства сервиса, не создавая копии самого баланса!

  /** Смена темы */
  switchTheme(theme: Theme) { this.userService.setTheme(theme); }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }
}
