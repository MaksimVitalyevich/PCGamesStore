import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSource = new BehaviorSubject<Game[]>([]);
  cart$ = this.itemsSource.asObservable();

  private totalSource= new BehaviorSubject<number>(0);
  totalAmount$ = this.totalSource.asObservable();

  constructor() {
    const saved = localStorage.getItem('cart'); // Локальное состояние корзины
    if (saved) {
      const parsed: Game[] = JSON.parse(saved);
      this.itemsSource.next(parsed);
      this.updateTotal(parsed);
    }
  }

  /** Добавит игру в корзину */
  addItem(game: Game): void {
    const updated = [...this.itemsSource.value, game];
    this.updateCart(updated);
  }

  /** Удаляет игру по ID */
  removeItem(id: number): void {
    const updated = this.itemsSource.value.filter(g => g.id === id);
    this.updateCart(updated);
  }

  /** Очистка корзины */
  clearCart(): void { this.updateCart([]); }

  private updateCart(games: Game[]): void {
    this.itemsSource.next(games);
    localStorage.setItem('cart', JSON.stringify(games));
    this.updateTotal(games);
  }

  private updateTotal(games: Game[]): void {
    const total = games.reduce((acc, g) => acc + g.price, 0);
    this.totalSource.next(total);
  }

  /** Синхронизация с сервером PHP */
  syncWithServer(): void {
    // TODO: здесь будет вызов к PHP API (пример для cart.php)
  }
}
