import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';
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
  @Input() user: any = null;

  topGames: Game[] = [];
  searchQuery = '';
  elemHover_header = false;
  elemHover_sidebar = false;

  constructor(
    private router: Router, 
    private userService: UserService, 
    private cartService: CartService
  ) { super(); }

  ngOnInit() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe(u => this.user = u);
    this.cartService.data$.pipe(takeUntil(this.destroy$)).subscribe(items => this.cartCount = items.length);
  }

  /** Поиск по названию (будет реализован через сервис) */
  onSearch() {
    const term = this.searchQuery.trim().toLowerCase();
    if (term.length === 0) return;
    alert(`Игра под названием "${term}" - Есть в списке! (Симуляция)`);
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/auth']);
  }

  gotoAbout() { this.router.navigate(['/about']); }
  goToAuth() { this.router.navigate(['/auth']); }
  goToCart() { this.router.navigate(['/cart']); }
  goToProfile() { this.router.navigate(['/profile']); }

  ngOnDestroy() { this.subClean(); }
  
}
