import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart.model';
import { PurchaseItem } from '../models/purchase.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private purchasedIdsSource = new BehaviorSubject<number[]>([]);
  purchasedIds$ = this.purchasedIdsSource.asObservable();
  private purchasesSource = new BehaviorSubject<PurchaseItem[]>([]);
  purchases$ = this.purchasesSource.asObservable();

  /** Готовая оформленная покупка игры */
  purchaseCompleted = new EventEmitter<PurchaseItem[]>();

  addPurchasedIds(id: number) { this.purchasedIdsSource.next([...this.purchasedIdsSource.getValue(), id]); }

  /** Получение списка купленных игр */
  getPurchasedGames(): PurchaseItem[] { return this.purchasesSource.value; }

  /** Помечает игру купленной (после действия самой покупки) */
  addMultiplePurchases(items: CartItem[]): void {
    const existing = this.purchasesSource.value;

    const newPurchases: PurchaseItem[] = items.map(item => ({
      id: item.id++,
      user_id: item.user_id,
      game_id: item.game_id,
      title: item.title,
      genre: item.genre || '',
      price: item.price,
      purchase_date: new Date()
    }));

    const unique = newPurchases.filter(p => !existing.some(e => e.game_id === p.game_id));
    if (unique.length) {
      const updated = [...existing, ...unique];
      this.purchasesSource.next(updated);
    }
  }

  /** Сброс покупки (если пользователь передумал ее покупать) */
  removePurchase(gameID: number): void { 
    const updated = this.getPurchasedGames().filter(p => p.id !== gameID);
    this.purchasesSource.next(updated);
  }

  /** Проверка купленности самой игры */
  hasPurchased(gameID: number): boolean { return this.getPurchasedGames().some((g) => g.id === gameID); }
  clearPurchases(): void { this.purchasesSource.next([]); }
}
