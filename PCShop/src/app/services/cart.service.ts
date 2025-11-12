import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { BehaviorSubject, Observable ,map, tap } from 'rxjs';
import { CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService extends BaseApiService<CartItem> {
  private readonly CART_API = "http://localhost:3000/PHPApp/api/cart.php";
  private totalSource= new BehaviorSubject<number>(0);
  totalAmount$ = this.totalSource.asObservable();

  constructor(http: HttpClient) { super(http, "http://localhost:3000/PHPApp/api/cart"); }

  getByUser(userId: number): Observable<CartItem[]> {
    return this.http.get<{ success: boolean; cart: CartItem[] }>(`${this.CART_API}?action=getCart&user_id=${userId}`,).pipe(map(res =>
      res.success ? res.cart : []),
      tap(list => {
        console.log(list);
        this.items$.next(list);
        this.calcTotal(list);
      }));
  }

  /** Обновляем корзину */
  updateCart(cart: CartItem[]) {
    this.items$.next(cart);
    this.calcTotal(cart);
  }

  /** Удаляет игру по ID */
  removefromCart(itemId: number, userId: number): Observable<any> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.CART_API}?action=remove`, { id: itemId }).pipe(tap(() =>
    this.refreshCart(userId))); 
  }

  /** Обновление состояния корзины (после внешних изменений) */
  refreshCart(userId: number) {
    return this.http.post<{success: boolean; cart: CartItem[]}>(`${this.CART_API}?action=getCart`, { user_id: userId }).pipe(tap(res => {
      res.success ? res.cart : [];
      this.items$.next(res.cart);
      this.calcTotal(res.cart);
  })).subscribe();
  }

  /** Очистка корзины */
  clearCart(userId: number): Observable<any> { 
    return this.http.post<{ success: boolean; message?: string }>(`${this.CART_API}?action=clear`, { user_id: userId }).pipe(tap(res => {
      if (res.success) {
        this.items$.next([]);
        this.totalSource.next(0);
      }
    }))
   }

  private calcTotal(items: CartItem[]): void {
    const total = items.reduce((sum, item) => sum + (item.price ?? 0) * 1, 0);
    this.totalSource.next(total);
  }
}
