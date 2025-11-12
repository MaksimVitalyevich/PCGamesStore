import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, map, tap } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { CartService } from './cart.service';
import { BaseApiService } from './base-api.service';
import { PaymentResponse } from '../models/paymentResponse.model';

@Injectable({ providedIn: 'root' })
export class PaymentService extends BaseApiService<PaymentResponse> {
  private readonly PAYMENT_API = "http://localhost:3000/PHPApp/api/payment.php";
  private readonly PROMO_API = "http://localhost:3000/PHPApp/api/promocodes.php";

  constructor(http: HttpClient, private cart: CartService) { super(http); }

  pay(userId: number): Observable<any> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.PAYMENT_API}?action=pay`, { user_id: userId }).pipe(tap(res => {
      if (res.success) {
        this.cart.refreshCart(userId);
      }
    }))
  }

  checkPromoCode(code: string): Observable<PaymentResponse> {
    return this.http.post<any>(`${this.PROMO_API}?action=check`, { code }).pipe(map(res =>
      res.success ? { success: true, message: 'Промокод активен', discountUsed: true } : { success: false, message: res.error || 'Промокод недействителен'}
    ), catchError(() => of({ success: false, message: 'Ошибка соединения с сервером'})));
  }

  /** Симуляция успешной оплаты */
  simulatePayment(data: any, total: number): Observable<PaymentResponse> {
    let discount = 0;
    if (data.method === 'promo' && data.promoCode) {
      return this.checkPromoCode(data.promoCode).pipe(map(result => {
        if (result.success) discount = result.discount ?? 0;
        const final = total - total * (discount / 100);
        return { success: true, message: `Оплата успешна! Списано: ${final.toFixed(2)} ₽`, finalAmount: final, discountUsed: !!discount };
      }), delay(800));
    }

    return of({ success: true, message: `Оплата прошла успешно! Итог: ${total.toFixed(2)} ₽`}).pipe(delay(800));
  }

  /** Проверка корректности карты (локальная) */
  validateCardNumber(card: string): boolean {
    const sanitized = card.replace(/\s+/g, '');
    return /^\d{16}$/.test(sanitized);
  }
  validateCVC(cvc: string): boolean { return /^\d{3}$/.test(cvc); }
  validateExpiryDate(expiry: string): boolean { return /^(0[1-9]|[1[0-2])\/\d{2}$/.test(expiry); }
}
