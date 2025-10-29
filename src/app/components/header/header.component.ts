import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';
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
export class HeaderComponent {
  @Input() cartCount = 0;
  @Input() user: any = null;

  topGames: Game[] = [];
  searchQuery = '';
  elemHover_header = false;
  elemHover_sidebar = false;

  constructor(private router: Router, private userService: UserService, private cartService: CartService) { }

  ngOnInit() {
    this.userService.user$.subscribe(u => this.user = u);
    this.cartService.cart$.subscribe(items => this.cartCount = items.length);

    // Тестовые данные. TODO: Заменить на данные из базы данных MySQL!
    this.topGames = [
      { id: 1, title: 'CyberPunk 2077', genre: 'RPG', systemRequirements: '', price: 1999 },
      { id: 2, title: 'Red Dead Redemption 2', genre: 'Action', systemRequirements: '', price: 2599 },
      { id: 3, title: 'Half-Life: Alyx', genre: 'Sci-Fi', systemRequirements: '', price: 2499 }
    ];
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

  goToAuth() { this.router.navigate(['/auth']); }
  goToCart() { this.router.navigate(['/cart']); }
  goToProfile() { this.router.navigate(['/profile']); }
  
}
