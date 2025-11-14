import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { BalanceService } from '../../services/balance.service';
import { PurchaseService } from '../../services/purchase.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PurchaseItem } from '../../models/purchase.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent extends Unsubscriber implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  user!: User;
  usergames: PurchaseItem[] = [];

  private static changedPhonePattern = /^\+7[\s(]*\d{3}[\s)]*\d{3}[\s-]?\d{2}[\s-]?\d{2}$/
  private static changedPasswordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/

  constructor(
    private fb: FormBuilder, 
    private userService: UserService, 
    private balanceService: BalanceService,
    private purchaseService: PurchaseService,
    private domSanitizer: DomSanitizer,
    private router: Router
  ) { super(); }

  ngOnInit() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (!user) {
        this.router.navigate(['/auth']);
        return;
      }

      this.user = user;
      this.profileForm = this.fb.group({
      username: [ { value: user.username, disabled: true } ],
      datebirth: [user.datebirth],
      credentials: [user.user_credentials],
      email: [user.email, [Validators.required, Validators.email]],
      phone: [user.phone, [Validators.required, Validators.pattern(ProfileComponent.changedPhonePattern)]],
      password: ['', [Validators.minLength(6), Validators.pattern(ProfileComponent.changedPasswordPattern)]]
    });
  });

  this.balanceService.balance$.pipe(takeUntil(this.destroy$)).subscribe(() => {}); // для реактивного обновления в непрерывном состоянии
  this.purchaseService.purchases$.pipe(takeUntil(this.destroy$)).subscribe(purchases => this.usergames = purchases);
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
  profileBalanceCheck() { return this.balanceService.balance }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy() { this.subClean(); }
}
