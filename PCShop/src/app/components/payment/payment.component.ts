import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PromocodeService } from '../../services/promocode.service';
import { PaymentService } from '../../services/payment.service';
import { CartService } from '../../services/cart.service';
import { PurchaseService } from '../../services/purchase.service';
import { UserService } from '../../services/user.service';
import { BalanceService } from '../../services/balance.service';
import { PayMethod } from '../../models/enumerators.model';
import { Promocode } from '../../models/promocode.model';
import { Router } from '@angular/router';
import { CartItem } from '../../models/cart.model';
import { PurchaseItem } from '../../models/purchase.model';
import { cartToPurchase } from '../../purchase-converter';

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
  activePromo: Promocode | null = null;
  message = "";
  isLoading = false;

  totalAmount = 0;
  discount = 0;
  balance = 0;

  constructor(
    private fb: FormBuilder, 
    private paymentService: PaymentService,
    private promocodeService: PromocodeService, 
    private cartService: CartService,
    private purchaseService: PurchaseService,
    private userService: UserService,
    private balanceService: BalanceService, 
    private router: Router
  ) { super(); }

  ngOnInit() {
    this.paymentForm = this.fb.group({
      method: [PayMethod.Card, Validators.required],
      cardNumber: [''],
      expiry: [''],
      cvc: [''],
      agreement: [false, Validators.requiredTrue]
    });

    this.cartService.data$.pipe(takeUntil(this.destroy$)).subscribe(items => this.cartItems = items || []);
    this.cartService.totalAmount$.pipe(takeUntil(this.destroy$)).subscribe(amount => {
      this.totalAmount = amount;
      this.updateFinalAmount();
    });

    this.balanceService.balance$.pipe(takeUntil(this.destroy$)).subscribe(b => this.balance === b);
    this.promocodeService.selectedPromo$.pipe(takeUntil(this.destroy$)).subscribe(p => this.activePromo = p);

    this.paymentForm.get('method')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(method => {
      const cardFields = ['cardNumber', 'expiry', 'cvc'];
      if (method === PayMethod.Card) cardFields.forEach(f => this.paymentForm.get(f)?.setValidators(Validators.required));
      else cardFields.forEach(f => this.paymentForm.get(f)?.clearValidators());
      cardFields.forEach(f => this.paymentForm.get(f)?.updateValueAndValidity());
    });
  }

  cancelPayment() { this.router.navigate(['/cart']); }

  applyPromo(code: string) {
    this.promocodeService.checkCode(code).subscribe(result => {
      this.discount = result.discountUsed ? result.discount ?? 0 : 0;
      this.message = result.message;
      this.updateFinalAmount();
    })
  }

  resetPromo() {
    this.discount = 0;
    this.activePromo = null;
    this.updateFinalAmount();
  }

  calculateTotal(items: CartItem[]) { return items.reduce((acc, item) => acc + (item.price || 0), 0); }
  updateFinalAmount() { 
    const base = this.calculateTotal(this.cartItems);
    return this.activePromo ? base * (1 - this.activePromo.discount / 100) : base;
  }

  async onSubmit() {
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
    
    this.message = "Выполняется обработка платежа...";
    setTimeout(() => this.isLoading = true, 1000);

    try {
      const result = await lastValueFrom(this.paymentService.processPayment(user.id, this.totalAmount, this.cartItems));
      this.isLoading = false;
      this.message = result.message;

      if (result.success) {
        setTimeout(() => this.router.navigate(['/purchases']), 1500);
        if (this.activePromo) {
          await lastValueFrom(this.promocodeService.applyCode(user.id, this.activePromo.code));
          this.promocodeService.clearPromo();
        }
      } 
    } catch (err) {
      this.isLoading = false;
      this.message = "Ошибка при оплате или добавлении покупок!";
      console.error(err);
    }
  }

  ngOnDestroy() { this.subClean(); }
}
