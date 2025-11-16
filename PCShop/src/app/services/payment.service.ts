import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { CartService } from './cart.service';
import { BaseApiService } from './base-api.service';
import { BalanceService } from './balance.service';
import { PurchaseService } from './purchase.service';
import { environment } from '../urls-environment';
import { CartItem } from '../models/cart.model';
import { PurchaseItem } from '../models/purchase.model';
import { cartToPurchase } from '../purchase-converter';

@Injectable({ providedIn: 'root' })
export class PaymentService extends BaseApiService<any> {
  private readonly PAYMENT_API = environment.api.payment;

  constructor(
    http: HttpClient, 
    private cartService: CartService,
    private balanceService: BalanceService, 
    private purchaseService: PurchaseService
  ) { super(http, environment.api.payment); }

  pay(userId: number): Observable<any> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.PAYMENT_API}?action=pay`, { user_id: userId });
  }

  /** Симуляция успешной оплаты */
  processPayment(userId: number, total: number, cartItems: CartItem[]): Observable<any> {
    if (total <= 0) return of({ success: false, message: 'Неверная сумма платежа!' });

    this.balanceService.decrease(total);

    return this.pay(userId).pipe(tap(payRes => {
      if (!payRes.success) throw new Error(payRes.message || 'Ошибка оплаты на сервере');
    }), switchMap(async () => {
      const purchases: PurchaseItem[] = cartItems.map(cartToPurchase);

      await Promise.all(purchases.map(p => lastValueFrom(this.purchaseService.addPurchase(userId, p))));
      await lastValueFrom(this.cartService.clearCart(userId));
    }), map(() => ({
      success: true,
      message: 'Оплата прошла успешно!'
    })), catchError(() => of({ success: false, message: 'Ошибка в процессе оплаты!' })));
  }

  /** Проверка корректности карты (локальная) */
  validateCardNumber(card: string): boolean {
    const sanitized = card.replace(/\s+/g, '');
    return /^\d{16}$/.test(sanitized);
  }
  validateCVC(cvc: string): boolean { return /^\d{3}$/.test(cvc); }
  validateExpiryDate(expiry: string): boolean { return /^(0[1-9]|[1[0-2])\/\d{2}$/.test(expiry); }
}
