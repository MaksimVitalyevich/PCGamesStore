import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Game } from '../../models/game.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  cart: Game[] = [];
  total = 0;

  constructor(private cartService: CartService, private router: Router) { }

  ngOnInit() {
    this.cartService.cart$.subscribe(items => this.cart = items);
    this.cartService.totalAmount$.subscribe(total => this.total = total);
  }

  remove(gameID: number) { this.cartService.removeItem(gameID); }
  clear() { this.cartService.clearCart(); }

  /** Переход к форме оплаты */
  gotoPayment() {
    if (this.cart.length === 0) {
      alert('Ваша корзина пустая!');
      return;
    }
    setTimeout(() => this.router.navigate(['/payment']), 400);
  }
}
