import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Promocode } from '../../models/promocode.model';
import { PromocodeService } from '../../services/promocode.service';
import { UserService } from '../../services/user.service';
import { UserRole } from '../../models/enumerators.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-promocodes-grid',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './promocodes-grid.component.html',
  styleUrl: './promocodes-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromocodesGridComponent extends Unsubscriber implements OnInit, OnDestroy {
  promoCodeForm!: FormGroup;
  @Input() promocodes: Promocode[] = [];
  @Input() role: UserRole | null = null;

  @Output() addPromo = new EventEmitter<Promocode>();
  @Output() editPromo = new EventEmitter<Promocode>();
  selectedPromoCode: Promocode | null = null;
  user: User | null = null;
  UserRole = UserRole;
  isEditing = false;

  message = "";
  checkResult = "";
  applyResult = "";

  private static PromocodePattern = /^[A-Z0-9]+$/;

  constructor(
    private fb: FormBuilder, 
    private promocodeService: PromocodeService, 
    private userService: UserService
  ) { super(); }

  ngOnInit(): void {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => this.user = user);
  }

  trackById(index: number, item: Promocode) { return item.id; }

  promoCodeEdit(promo?: Promocode) {
    this.selectedPromoCode = promo || null;
    this.isEditing = true;

    this.promoCodeForm = this.fb.group({
      code: [promo?.code || '', [Validators.required, Validators.minLength(3), Validators.pattern(PromocodesGridComponent.PromocodePattern)]],
      discount: [promo?.discount || 5, [Validators.required, Validators.min(1), Validators.max(100)]],
      description: [promo?.description || ''],
      is_active: [promo?.is_active || false, Validators.requiredTrue],
      created_at: [promo?.created_at || null, Validators.required],
      expires_at: [promo?.expires_at || null],
      max_uses: [promo?.max_uses || 3, [Validators.required, Validators.min(1), Validators.max(10)]],
      is_new_user_only: [promo?.is_new_user_only || false]
    });
  }

  onSave() {
    if (this.promoCodeForm.invalid) return;

    const promoData = { ...this.selectedPromoCode, ...this.promoCodeForm.value };
    if (this.selectedPromoCode) {
      this.editPromo.emit(promoData);
    } else {
      promoData.id = this.promocodes.length ? Math.max(...this.promocodes.map(p => p.id)) + 1 : 1;
      this.addPromo.emit(promoData);
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.selectedPromoCode = null;
  }

  onCheck(code: string) {
    this.promocodeService.checkCode(code).pipe(tap(res => {
      this.checkResult = res.success ? `Промокод активен! Скидка: ${res.discount}%` : (res.message ?? "Ошибка проверки")
    })).subscribe();
  }

  onApply(promoCode: Promocode) {
    if (!this.user || !(this.role === UserRole.User || this.role === UserRole.PremiumUser)) {
      this.message = "Нет прав на использование промокодов.";
      return;
    }

    if (promoCode.max_uses === 1 && promoCode.used_count >= 1) {
      this.message = "Этот промокод - одноразовый И уже был использован!";
      return;
    }

    if (promoCode.is_new_user_only) {
      const createdAt = new Date(this.user.created_at);
      const daysLimit = (Date.now() - createdAt.getTime()) / (1000 * 3600 * 24);

      if (daysLimit > 7) {
        this.message = "Этот промокод - доступен лишь новым пользователям.";
        return;
      }
    }

    this.promocodeService.setPromo(promoCode);
    this.applyResult = `Выбран промокод: ${promoCode.code} (-${promoCode.discount}%)`;
  }

  onReactivate(code: string) {
    if (this.role !== UserRole.Moderator) {
      this.message = "Нет прав на переактивацию.";
      return;
    }

    this.promocodeService.reactivateCode(code).pipe(tap(res => this.message = res.message), switchMap(() => 
      this.promocodeService.getPromocodes())).subscribe();
  }

  onResetUse(code: string) {
    if (this.role !== UserRole.Moderator) {
      this.message = "Нет прав на сброс использования.";
      return;
    }

    this.promocodeService.resetUsage(code).pipe(tap(res => this.message = res.message), switchMap(() => 
      this.promocodeService.getPromocodes())).subscribe();
  }

  onDeactivate(code: string) {
    if (this.role !== UserRole.Moderator) {
      this.message = "Нет прав на деактивацию.";
      return;
    }

    this.promocodeService.deactivateCode(code).pipe(tap(res => this.message = res.message), switchMap(() =>
      this.promocodeService.getPromocodes())).subscribe();
  }

  ngOnDestroy(): void { this.subClean(); }
}
