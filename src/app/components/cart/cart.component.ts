import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Game } from '../../models/game.model';
import { NgIf, NgFor } from "../../../../node_modules/@angular/common/index";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgIf, NgFor],
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
