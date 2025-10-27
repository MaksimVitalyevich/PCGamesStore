import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private purchasesSource = new BehaviorSubject<Game[]>([]);
  purchases$ = this.purchasesSource.asObservable();

  purchaseCompleted = new EventEmitter<Game[]>();

  addPurchase(game: Game): void {
    if (this.purchasesSource.value.some((g) => g.id === game.id)) return;

    const updated = [...this.purchasesSource.value, { ...game, purchaseDate: game.purchaseDate }];
    this.purchasesSource.next(updated);
    this.purchaseCompleted.emit(updated);
  }

  hasPurchased(gameID: number): boolean { return this.purchasesSource.value.some((g) => g.id === gameID); }
  clearPurchases(): void { this.purchasesSource.next([]); }
}
