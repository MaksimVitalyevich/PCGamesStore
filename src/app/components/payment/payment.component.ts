import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { CartService } from '../../services/cart.service';
import { BalanceService } from '../../services/balance.service';
import { PayMethod } from '../../models/enumerators.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent {
  paymentForm!: FormGroup;
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
    private balanceService: BalanceService, 
    private router: Router
  ) { }

  ngOnInit() {
    this.paymentForm = this.fb.group({
      method: [PayMethod.Card, Validators.required],
      cardNumber: [''],
      expiry: [''],
      cvc: [''],
      promoCode: [''],
      agreement: [false, Validators.requiredTrue]
    });

    this.cartService.totalAmount$.subscribe(amount => {
      this.totalAmount = amount;
      this.updateFinalAmount();
    });

    this.balanceService.balance$.subscribe(b => this.balance === b)

    this.paymentForm.get('promoCode')?.valueChanges.subscribe(code => {
      if (code && code.length >= 4) this.applyPromo(code);
      else this.resetPromo();
    });

    this.paymentForm.get('method')?.valueChanges.subscribe(method => {
      const cardFields = ['cardNumber', 'expiry', 'cvc'];
      if (method === PayMethod.Card) {
        cardFields.forEach(f => this.paymentForm.get(f)?.setValidators(Validators.required));
      } else {
        cardFields.forEach(f => this.paymentForm.get(f)?.clearValidators());
      }
      cardFields.forEach(f => this.paymentForm.get(f)?.updateValueAndValidity());
    });
  }

  cancelPayment() {
    this.isLoading = false;
    this.router.navigate(['/cart']);
  }

  applyPromo(code: string) {
    const result = this.paymentService.applyPromoCode(code);
    this.discount = result.success ? result.discount! : 0;
    this.updateFinalAmount();
    this.message = result.message;
  }

  resetPromo() {
    this.discount = 0;
    this.updateFinalAmount();
  }

  updateFinalAmount() { this.finalAmount = this.totalAmount - (this.totalAmount * this.discount / 100); }

  onSubmit() {
    if (this.paymentForm.invalid) {
      this.message = "Пожалуйста, Проверьте корректность введённых данных и подтвердите согласие!";
      this.paymentForm.markAllAsTouched();
      return;
    }

    if (this.balanceService.balance < this.finalAmount) {
      this.message = "У вас недостаточно средств на счету!";
      return;
    }
    
    this.isLoading = true;

    this.paymentService.simulatePayment(this.paymentForm.value, this.totalAmount).subscribe(result => {
      this.isLoading = false;
      if (result.success) {
        this.balanceService.decrease(this.finalAmount);
        this.cartService.clearCart();
        this.message = `Оплата прошла успешно! С вашего счета списано ${this.finalAmount.toFixed(2)} ₽`;
        setTimeout(() => this.router.navigate(['/profile']), 2500);
      } else {
        this.message = "Сбой при оплате!";
      }
    });
  }
}
