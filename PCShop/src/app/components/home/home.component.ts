import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil, take, switchMap } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { Game } from '../../models/game.model';
import { CartItem } from '../../models/cart.model';
import { GameService } from '../../services/game.service';
import { RatingService } from '../../services/rating.service';
import { CartService } from '../../services/cart.service';
import { PurchaseService } from '../../services/purchase.service';
import { UserService } from '../../services/user.service';
import { UserRole } from '../../models/enumerators.model';
import { GameGridComponent } from '../game-grid/game-grid.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, GameGridComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent extends Unsubscriber implements OnInit, OnDestroy {
  games: Game[] = [];
  cartItems: CartItem[] = [];
  purchasedIds: number[] = [];
  userId!: number;
  role: UserRole | null = null;
  isLoading = true;
  message = "";

  constructor( 
    private gameService: GameService,
    private ratingService: RatingService, 
    private cartService: CartService,
    private purchaseService: PurchaseService, 
    private userService: UserService
  ) { super(); }

  ngOnInit() {
    const user = this.userService.user;
    if (!user) {
      this.message = "Ошибка: пользователь не найден.";
      this.isLoading = false;
      return;
    }
    this.userId = user.id;

    this.gameService.getGames().pipe(takeUntil(this.destroy$)).subscribe({next: (games) => {
      this.games = games;
      games.forEach(game => {
        this.ratingService.getRating$(game.title).pipe(take(1)).subscribe(rating => {
          if (rating === 0) {
            this.ratingService.setRating(game.title, game.rating);
          }
        });
      });
      setTimeout(() => this.isLoading = false, 1000);
      }, error: () => {
        this.message = "Ошибка при загрузке списка игр.";
        this.isLoading = false;
      }
    });
    this.userService.role$.pipe(takeUntil(this.destroy$)).subscribe(role => this.role = role);
    this.cartService.data$.pipe(takeUntil(this.destroy$)).subscribe(cartItems => this.purchasedIds = cartItems.filter(c => c.user_id === this.userId).map(c => c.game_id));
  }

  /** Обновление UI списка игр */
  getGames() { return this.gameService.getGames().subscribe({next: (games) => this.games = games}); }

  /** Проверка купленности самой игры */
  isPurchasedAlready(gameID: number) { return this.purchasedIds.includes(gameID); }
  /** Получение Observable шаблона звезд (используется извне для других компонентов) */
  getStars(gameTitle: string) { return this.ratingService.getStars$(gameTitle); }

  /** Добавить игру в корзину */
  buyGame(game: Game) {
    if (!this.userService.isAuthenticated()) {
      alert('Только авторизованные пользователи могут покупать игры!');
      return;
    }

    if (!this.isPurchasedAlready(game.id)) {
      this.gameService.buyGame(this.userId, game.id).subscribe(res => {
          if (res.success) {
            this.cartService.refreshCart(this.userId);
            this.purchaseService.addPurchasedIds(game.id);
            alert(`Игра "${game.title}" добавлена в вашу корзину!`);
          } else {
            alert(`Ошибка покупки: ${res.message || 'Неизвестное действие'}`);
          }
        }
      );
    }
  }

  addNewGame(newGame: Partial<Game>) { 
    this.gameService.add(newGame).subscribe(); 
    this.getGames();
  }

  editGame(game: Game) {
    const updated = { ...game, price: game.price };
    this.gameService.update(updated).subscribe();
    this.getGames();
  }

  deleteGame(gameID: number) {
    this.gameService.delete(gameID).subscribe(res => {
      if (res.success) {
        this.cartService.removefromCart(gameID, this.userId).subscribe();
        this.getGames();
        alert(`Удалена игра: ${gameID}`);
      } else {
        alert(`Ошибка удаления: ${res.message || 'Неизвестное действие'}`);
      }
    });
  }

  ngOnDestroy() { this.subClean(); }
}