import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { CartService } from '../../services/cart.service';
import { PayMethod, UserService } from '../../services/user.service';
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
    private userService: UserService, 
    private router: Router
  ) { }

  ngOnInit() {
    this.paymentForm = this.fb.group({
      method: [PayMethod.Card, Validators.required],
      cardNumber: [''],
      expiry: [''],
      cvc: [''],
      agreement: [false, Validators.requiredTrue]
    });

    this.cartService.totalAmount$.subscribe(amount => {
      this.totalAmount = amount;
      this.updateFinalAmount();
    });

    this.userService.balance$.subscribe(b => this.balance = b);

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

  updateFinalAmount() {
    this.finalAmount = this.totalAmount - (this.totalAmount * this.discount / 100);
  }

  onSubmit() {
    if (this.paymentForm.invalid) {
      this.message = "Пожалуйста, Проверьте корректность введённых данных и подтвердите согласие!";
      this.paymentForm.markAllAsTouched();
      return;
    }

    if (!this.userService.canAfford(this.finalAmount)) {
      this.message = "У вас недостаточно средств на счету!";
      return;
    }
    
    this.isLoading = true;

    this.paymentService.simulatePayment(this.paymentForm.value, this.totalAmount).subscribe(result => {
      this.isLoading = false;
      if (result.success) {
        this.userService.updateBalance(this.finalAmount);
        this.cartService.clearCart();
        this.message = `Оплата прошла успешно! С вашего счета списано ${this.finalAmount.toFixed(2)} ₽`;
        setTimeout(() => this.router.navigate(['/profile']), 2500);
      } else {
        this.message = "Сбой при оплате!";
      }
    });
  }
}
