import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';
import { FiltrationService } from '../../services/filtration.service';
import { Game } from '../../models/game.model';
import { brightnessAnim, textColorAnim, headerSlideIn, sidebarSlideIn } from '../../app.animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: '../../framing.style.scss',
  animations: [brightnessAnim, textColorAnim, headerSlideIn, sidebarSlideIn]
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
    private cartService: CartService,
    private filterService: FiltrationService
  ) { super(); }

  ngOnInit() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe(u => this.user = u);
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(items => this.cartCount = items.length);

    // Тестовые данные. TODO: Заменить на данные из базы данных MySQL!
    this.topGames = [
      { id: 1, title: 'CyberPunk 2077', genre: 'RPG', rating: 5.5, systemRequirements: '', price: 1999 },
      { id: 2, title: 'Red Dead Redemption 2', genre: 'Action', rating: 7.7, systemRequirements: '', price: 2599 },
      { id: 3, title: 'Half-Life: Alyx', genre: 'Sci-Fi', rating: 8.0, systemRequirements: '', price: 2499 }
    ];
  }

  /** Поиск по названию (будет реализован через сервис) */
  onSearch() {
    const term = this.searchQuery.trim().toLowerCase();
    if (term.length === 0) return;
    alert(`Игра под названием "${term}" - Есть в списке! (Симуляция)`);
  }
  onFilterClick() { this.filterService.toggleFilter(); }

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
