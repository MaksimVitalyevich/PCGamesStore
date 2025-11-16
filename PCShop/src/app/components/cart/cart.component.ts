import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { combineLatest } from 'rxjs';
import { CartItem } from '../../models/cart.model';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent extends Unsubscriber implements OnInit, OnDestroy {
  user: User | null = null;
  purchasedIds: number[] = [];
  items: CartItem[] = [];
  total = 0;
  isLoading = true;

  constructor(private cartService: CartService, private purchaseService: PurchaseService, private userService: UserService, private router: Router) { super(); }

  ngOnInit() {
    combineLatest([
      this.cartService.data$,
      this.userService.user$
    ]).pipe(takeUntil(this.destroy$)).subscribe(([items, user]) => {
      if (user) {
        this.items = items.filter(i => i.user_id === user.id);
        this.total = this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
      } else {
        this.items = [];
        this.total = 0;
      }
      this.isLoading = false;
    });

    // При старте подгрузится актуальная корзина
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) this.cartService.getByUser(user.id).subscribe();
    });
    this.purchaseService.purchasedIds$.subscribe(ids => this.purchasedIds = ids);
  }

  trackById(index: number, item: CartItem) { return item.id; }

  remove(itemID: number) { 
    const user = this.userService.user;
    if (!user) return;

    this.cartService.removefromCart(itemID, user.id).subscribe();
  }
  refresh() { 
    this.userService.user$.subscribe(user => {
      if (user) this.cartService.refreshCart(user.id);
    });
  }
  clear() { 
    this.userService.user$.subscribe(user => {
      if (user) this.cartService.clearCart(user.id).subscribe();
    }) 
  }

  /** Переход к форме оплаты */
  gotoPayment() {
    if (this.items.length === 0) {
      alert('Ваша корзина пустая!');
      return;
    }
    this.isLoading = true;
    setTimeout(() => this.router.navigate(['/payment']), 800);
  }

  ngOnDestroy() { this.subClean(); }
}
