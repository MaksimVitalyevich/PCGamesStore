import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';
import { PurchaseService } from '../../services/purchase.service';
import { Game } from '../../models/game.model';
import { brightnessAnim, headerSlideIn, sidebarSlideIn } from '../../app.animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: '../../framing.style.scss',
  animations: [brightnessAnim, headerSlideIn, sidebarSlideIn]
})
export class HeaderComponent extends Unsubscriber implements OnInit, OnDestroy {
  @Input() cartCount = 0;
  @Input() purchasesCount = 0;
  @Input() user: any = null;

  topGames: Game[] = [];
  searchQuery = '';
  elemHover_header = false;
  elemHover_sidebar = false;

  constructor(
    private router: Router, 
    private userService: UserService, 
    private cartService: CartService,
    private purchaseService: PurchaseService
  ) { super(); }

  ngOnInit() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe(u => this.user = u);
    this.cartService.data$.pipe(takeUntil(this.destroy$)).subscribe(items => this.cartCount = items.length);
    this.purchaseService.purchases$.pipe(takeUntil(this.destroy$)).subscribe(p => this.purchasesCount = p.length);
  }

  /** Поиск по названию (будет реализован через сервис) */
  onSearch() {
    const term = this.searchQuery.trim().toLowerCase();
    if (term.length === 0) return;
    alert(`Игра под названием "${term}" - Есть в списке! (Симуляция)`);
  }

  logout() {
    const userID = this.userService.user!.id;
    if (userID) {
      this.cartService.clearCart(userID).subscribe({
        next: () => this.cartCount = 0
      })
    }

    this.userService.logout();
    this.router.navigate(['/auth']);
  }

  ngOnDestroy() { this.subClean(); }
  
}
