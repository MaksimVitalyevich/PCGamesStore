import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { CartItem } from '../models/cart.model';
import { PurchaseItem } from '../models/purchase.model';
import { environment } from '../urls-environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService extends BaseApiService<PurchaseItem> {
  private readonly PURCHASE_API = environment.api.purchases;
  private purchasedIdsSource = new BehaviorSubject<number[]>([]);
  purchasedIds$ = this.purchasedIdsSource.asObservable();
  private purchasesSource = new BehaviorSubject<PurchaseItem[]>([]);
  purchases$ = this.purchasesSource.asObservable();

  constructor(http: HttpClient) { super(http, environment.api.purchases) }

  /** Готовая оформленная покупка игры */
  purchaseCompleted = new EventEmitter<PurchaseItem[]>();

  addPurchasedIds(id: number) { this.purchasedIdsSource.next([...this.purchasedIdsSource.getValue(), id]); }

  getPurchases(userId: number): Observable<PurchaseItem[]> {
    return this.http.get<{ success: boolean; purchases: PurchaseItem[] }>(`${this.PURCHASE_API}?action=getPurchases&user_id=${userId}`).pipe(map(res =>
      res.success ? res.purchases : []), tap(pList => {
        this.purchasesSource.next(pList);
        this.purchasedIdsSource.next(pList.map(p => p.game_id));
    }));
  }

  addPurchase(userId: number, purchase: PurchaseItem): Observable<any> {
    const payLoad = {
      user_id: userId,
      game_id: purchase.game_id,
      title: purchase.title,
      price: purchase.price,
      purchase_date: purchase.purchase_date.toISOString()
    };

    return this.http.post<{ success: boolean; message?: string; purchase: PurchaseItem }>(`${this.PURCHASE_API}?action=addPurchase`, payLoad).pipe(tap(res => {
      if (res.success && res.purchase) {
        const current = this.purchasesSource.value;
        this.purchasesSource.next([...current, res.purchase]);

        const ids = [...this.purchasedIdsSource.value, res.purchase.game_id];
        this.purchasedIdsSource.next(ids);

        this.purchaseCompleted.emit([res.purchase]);
      }
    }))
  }

  checkPurchase(userId: number, gameId: number): Observable<any> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.PURCHASE_API}?action=checkPurchase`, { user_id: userId, game_id: gameId }).pipe(map(res => ({
      success: res.success,
      message: res.message
    })));
  }

  ownedGames(userId: number): Observable<PurchaseItem[]> {
    return this.http.get<{ success: boolean; purchases: PurchaseItem[] }>(`${this.PURCHASE_API}?action=owned&user_id=${userId}`).pipe(map(res => 
      res.success ? res.purchases : []));
  }

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

  clearPurchases(): void { 
    this.purchasesSource.next([]);
    this.purchasedIdsSource.next([]);
  }
}
