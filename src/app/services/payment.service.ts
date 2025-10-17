import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private promoCodes = [
    { code: 'STARTER', discount: 10 },
    { code: 'COOLGAMER', discount: 25 },
    { code: 'WINTER', discount: 5 },
    { code: 'VIPGAMER', discount: 50 }
  ];

  constructor() { }

  /** Симуляция успешной оплаты */
  simulatePayment(data: any, total: number): Observable<{ success: boolean; message: string}> {
    console.log('Транзакция:', data);

    let discount = 0;
    if (data.method === 'promo' && data.promoCode) {
      const result = this.applyPromoCode(data.promoCode);
      if (result.success) discount = result.discount || 0;
    }

    const finalAmount = total - (total * discount / 100);

    // имитируем небольшую задержку
    return of({
      success: true,
      message: `Оплата успешна! Итоговая сумма: ${finalAmount.toFixed(2)} ₽`,
      finalAmount
    }).pipe(delay(1200));
  }

  /** Проверка корректности карты (локальная) */
  validateCardNumber(card: string): boolean {
    const sanitized = card.replace(/\s+/g, '');
    return /^\d{16}$/.test(sanitized);
  }

  validateCVC(cvc: string): boolean {
    return /^\d{3}$/.test(cvc);
  }

  applyPromoCode(code: string): { success: boolean; discount?: number; message: string } {
    const promo = this.promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (promo) {
      return { success: true, discount: promo.discount, message: `Промокод активирован! Скидка ${promo.discount}%` };
    }
    return { success: false, message: "Промокод недействителен!" };
  }

  validateExpiryDate(expiry: string): boolean {
    return /^(0[1-9]|[1[0-2])\/\d{2}$/.test(expiry);
  }
}
