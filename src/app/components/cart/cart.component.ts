import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Game } from '../../models/game.model';

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

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cart = items;
      this.total = this.cartService.getTotal();
    });
  }

  remove(gameID: number) {
    this.cartService.removeFromCart(gameID);
  }

  clear() {
    this.cartService.clearCart();
  }
}
