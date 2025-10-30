import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
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
export class CartComponent extends Unsubscriber implements OnInit, OnDestroy {
  cart: Game[] = [];
  total = 0;

  constructor(private cartService: CartService, private router: Router) { super(); }

  ngOnInit() {
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(items => this.cart = items);
    this.cartService.totalAmount$.pipe(takeUntil(this.destroy$)).subscribe(total => this.total = total);
  }

  remove(gameID: number) { this.cartService.removeItem(gameID); }
  refresh() { this.cartService.refreshCart(); }
  clear() { this.cartService.clearCart(); }

  /** Переход к форме оплаты */
  gotoPayment() {
    if (this.cart.length === 0) {
      alert('Ваша корзина пустая!');
      return;
    }
    setTimeout(() => this.router.navigate(['/payment']), 400);
  }

  ngOnDestroy() { this.subClean(); }
}
