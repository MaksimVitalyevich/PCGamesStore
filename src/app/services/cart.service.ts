import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: Game[] = [];
  private cartSubject = new BehaviorSubject<Game[]>([]);
  cart$ = this.cartSubject.asObservable();

  private totalAmountSubject = new BehaviorSubject<number>(0);
  totalAmount$ = this.totalAmountSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('cart'); // Локальное состояние корзины
    if (saved) {
      this.cartItems = JSON.parse(saved);
      this.updateCart();
    }
   }

   /** Вернет текущее состояние корзины */
  getCart(): Game[] { return [...this.cartItems]; }

  /** Добавит игру в корзину */
  addToCart(game: Game): void {
    if (!this.cartItems.find(g => g.id === game.id)) {
      this.cartItems.push(game);
      this.updateCart();
    }
  }

  /** Удаляет игру по ID */
  removeFromCart(gameID: number): void {
    this.cartItems = this.cartItems.filter(g => g.id !== gameID);
    this.updateCart();
  }

  /** Очистка корзины */
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  /** Подсчет итоговой суммы (однократно) */
  getTotal(): number { return this.totalAmountSubject.value; }

  /** Пересчет суммы + сохранение корзины */
  private updateCart(): void {
    const total = this.cartItems.reduce((sum, game) => sum + (game.price || 0), 0);
    this.totalAmountSubject.next(total);
    this.cartSubject.next([...this.cartItems]);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  //checkout(): Observable<PaymentResponse>;
  //loadCartFromServer(userID: number): Observable<Game[]>;

  /** Синхронизация с сервером PHP */
  syncWithServer(): void {
    // TODO: здесь будет вызов к PHP API (пример для cart.php)
  }
}
