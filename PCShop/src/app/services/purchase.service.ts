import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private purchasedIdsSource = new BehaviorSubject<number[]>([]);
  purchasedIds$ = this.purchasedIdsSource.asObservable();
  private purchasesSource = new BehaviorSubject<Game[]>([]);
  purchases$ = this.purchasesSource.asObservable();

  /** Готовая оформленная покупка игры */
  purchaseCompleted = new EventEmitter<Game[]>();

  setPurchasedIds(ids: number[]) { this.purchasedIdsSource.next(ids); }
  addPurchasedIds(id: number) { this.purchasedIdsSource.next([...this.purchasedIdsSource.getValue(), id]); }

  /** Получение списка купленных игр */
  getPurchasedGames(): Game[] { return this.purchasesSource.value; }

  /** Помечает игру купленной (после действия самой покупки) */
  addPurchase(game: Game): void {
    if (!this.getPurchasedGames().some(g => g.id === game.id)) {
      const updated = [...this.getPurchasedGames(), game];
      this.purchasesSource.next(updated);
      this.purchaseCompleted.emit(updated);
    }
  }
  addMultiplePurchases(games: Game[]): void { 
    const unique = games.filter(g => !this.getPurchasedGames().some(c => c.id === g.id));
    if (unique.length > 0) {
      const updated = [...this.getPurchasedGames(), ...unique];
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
