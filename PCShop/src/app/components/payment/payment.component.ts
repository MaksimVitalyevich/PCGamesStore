import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EMPTY  } from 'rxjs';
import { takeUntil, switchMap, tap } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { PurchaseService } from '../../services/purchase.service';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { BalanceService } from '../../services/balance.service';
import { PayMethod } from '../../models/enumerators.model';
import { Router } from '@angular/router';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent extends Unsubscriber implements OnInit, OnDestroy {
  paymentForm!: FormGroup;
  cartItems: CartItem[] = [];
  message = "";
  isLoading = false;

  totalAmount = 0;
  discount = 0;
  finalAmount = 0;
  balance = 0;

  constructor(
    private fb: FormBuilder, 
    private paymentService: PaymentService, 
    private cartService: CartService,
    private userService: UserService,
    private purchaseService: PurchaseService,
    private balanceService: BalanceService, 
    private router: Router
  ) { super(); }

  ngOnInit() {
    this.paymentForm = this.fb.group({
      method: [PayMethod.Card, Validators.required],
      cardNumber: [''],
      expiry: [''],
      cvc: [''],
      promoCode: [''],
      agreement: [false, Validators.requiredTrue]
    });

    this.cartService.data$.pipe(takeUntil(this.destroy$)).subscribe(items => this.cartItems = items || []);
    this.cartService.totalAmount$.pipe(takeUntil(this.destroy$)).subscribe(amount => {
      this.totalAmount = amount;
      this.updateFinalAmount();
    });

    this.balanceService.balance$.pipe(takeUntil(this.destroy$)).subscribe(b => this.balance === b)

    this.paymentForm.get('promoCode')?.valueChanges.subscribe(code => {
      if (code && code.length >= 4) this.applyPromo(code);
      else this.resetPromo();
    });

    this.paymentForm.get('method')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(method => {
      const cardFields = ['cardNumber', 'expiry', 'cvc'];
      if (method === PayMethod.Card) cardFields.forEach(f => this.paymentForm.get(f)?.setValidators(Validators.required));
      else cardFields.forEach(f => this.paymentForm.get(f)?.clearValidators());
      cardFields.forEach(f => this.paymentForm.get(f)?.updateValueAndValidity());
    });
  }

  cancelPayment() { this.router.navigate(['/cart']); }

  applyPromo(code: string) {
    this.paymentService.checkPromoCode(code).subscribe(result => {
      this.discount = result.discountUsed ? result.discount ?? 0 : 0;
      this.message = result.message;
      this.updateFinalAmount();
    })
  }

  resetPromo() {
    this.discount = 0;
    this.message = "";
    this.updateFinalAmount();
  }

  calculateTotal(items: CartItem[]) { return items.reduce((acc, item) => acc + (item.price || 0), 0); }
  updateFinalAmount() { this.finalAmount = this.totalAmount - (this.totalAmount * this.discount / 100); }

  onSubmit() {
    if (this.paymentForm.invalid) {
      this.message = "Пожалуйста, Проверьте корректность введённых данных и подтвердите согласие!";
      this.paymentForm.markAllAsTouched();
      return;
    }

    const user = this.userService.user;
    if (!user) {
      this.message = "Ошибка: Пользователь не найден!";
      return;
    }
    
    this.totalAmount = this.calculateTotal(this.cartItems);
    this.balance = user.balance;
    if (this.balance < this.totalAmount) {
      this.message = "У вас недостаточно средств на счету!";
      return;
    }
    
    this.isLoading = true;
    this.message = "Выполняется обработка платежа...";

    this.paymentService.simulatePayment(this.paymentForm.value, this.totalAmount).pipe(takeUntil(this.destroy$), switchMap(simResult => {
      if (!simResult.success) {
        this.message = "Сбой при симуляции оплаты!";
        this.isLoading = false;
        return EMPTY;
      }

      // Уменьшаем баланс
      this.balanceService.decrease(this.totalAmount);

        // Отправляем реальный платеж на сервер
      return this.paymentService.pay(user.id).pipe(tap(payResult => {
          if (!payResult.success) { throw new Error(payResult.message || "Ошибка платежа на сервере"); } }));
    })
  ).subscribe({ next: () => {
        // Обновляем покупки
        this.purchaseService.addMultiplePurchases(this.cartItems);

        // Очищаем корзину
        this.cartService.clearCart(user.id);

        // Сбрасываем UI
        this.totalAmount = 0;
        this.message = "Оплата прошла успешно! Перенаправление...";

        // Плавный редирект
        setTimeout(() => this.router.navigate(['/purchases']), 2000);
      },
      error: err => { this.message = err.message || "Произошла ошибка при оплате!"; }
    });
  }

  ngOnDestroy() { this.subClean(); }
}
