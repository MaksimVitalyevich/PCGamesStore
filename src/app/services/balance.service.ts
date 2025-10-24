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

  setBalance(amount: number): void {
    this.balanceSource.next(amount);
    localStorage.setItem('balance', amount.toString());
  }

  increase(amount: number): void { this.setBalance(this.balance + amount); }
  decrease(amount: number): void { this.setBalance(Math.max(0, this.balance - amount)); }
}
