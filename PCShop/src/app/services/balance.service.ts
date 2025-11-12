import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class BalanceService {

  private balanceSource = new BehaviorSubject<number>(0);
  balance$ = this.balanceSource.asObservable();

  constructor() { 
    const saved = localStorage.getItem('balance');
    if (saved) this.balanceSource.next(+saved);
  }

  /** Получение баланса пользователя */
  get balance(): number { return this.balanceSource.value; }

  /** Устанавливает новые значения счета пользователя */
  setBalance(amount: number): void {
    const numericAmount = Number(amount) || 0;
    this.balanceSource.next(amount);
    localStorage.setItem('balance', numericAmount.toString());
  }

  increase(amount: number): void { 
    const current = this.balanceSource.getValue();
    const newBalance = current + Number(amount);
    this.balanceSource.next(newBalance);
    localStorage.setItem('balance', newBalance.toString());
  }
  decrease(amount: number): void {
    const current = this.balanceSource.getValue();
    const newBalance = current - Number(amount);
    this.balanceSource.next(newBalance);
    localStorage.setItem('balance', newBalance.toString()); 
  }
}
