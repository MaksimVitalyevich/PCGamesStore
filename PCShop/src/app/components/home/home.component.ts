import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil, take, switchMap } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { Game } from '../../models/game.model';
import { Promocode } from '../../models/promocode.model';
import { GameService } from '../../services/game.service';
import { PromocodeService } from '../../services/promocode.service';
import { RatingService } from '../../services/rating.service';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { UserRole } from '../../models/enumerators.model';
import { PromocodesGridComponent } from '../promocodes-grid/promocodes-grid.component';
import { GameGridComponent } from '../game-grid/game-grid.component';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PromocodesGridComponent, GameGridComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent extends Unsubscriber implements OnInit, OnDestroy {
  games: Game[] = [];
  promocodes: Promocode[] = [];
  purchasedIds: number[] = [];
  user: User | null = null;
  role: UserRole | null = null;
  isLoading = true;

  constructor( 
    private gameService: GameService,
    private promoService: PromocodeService,
    private ratingService: RatingService, 
    private cartService: CartService,
    private purchaseService: PurchaseService, 
    private userService: UserService
  ) { super(); }

  ngOnInit() {
    this.user = this.userService.user;

    this.gameService.data$.pipe(takeUntil(this.destroy$)).subscribe(games => {
      this.games = games;
      games.forEach(game => {
        this.ratingService.getRating$(game.title).pipe(take(1)).subscribe(rating => {
          if (rating === 0) {
            this.ratingService.setRating(game.title, game.rating);
          }
        });
      });
      setTimeout(() => this.isLoading = false, 1000);
    });
    this.promoService.promo$.pipe(takeUntil(this.destroy$)).subscribe(promos => {
      this.promocodes = promos;
    });
    this.userService.role$.pipe(takeUntil(this.destroy$)).subscribe(role => this.role = role);
    this.cartService.data$.pipe(takeUntil(this.destroy$)).subscribe(cartItems => this.purchasedIds = cartItems.filter(c => c.user_id === this.user!.id).map(c => c.game_id));
    this.gameService.getGames().subscribe();
    this.promoService.getPromocodes().subscribe();
  }

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


    this.purchaseService.checkPurchase(this.user!.id, game.id).pipe(take(1)).subscribe({
      next: res => {
        if (res.success) {
          this.gameService.buyGame(this.user!.id, game.id).subscribe(response => {
            if (response.success) alert(`Игра ${game.title} успешно добавлена в корзину!`);
            else alert(response.message || "Неизвестное действие");
          });
        } else {
          alert(`Вы уже купили игру ${game.title}!`);
        }
      }
    });
  }

  addNewGame(newGame: Game) { this.gameService.addGame(newGame).subscribe(); }

  addPromocode(newPromo: Promocode) {
    if (this.role !== UserRole.Moderator) {
      alert('Недостаточно прав для добавления промокода.');
      return;
    }

    this.promoService.addPromo(newPromo.code, newPromo.discount, newPromo.created_at).subscribe();
  }
  editGame(game: Game) { this.gameService.updateGame(game).subscribe(); }

  editPromocode(promo: Promocode) {
    if (this.role !== UserRole.Moderator) {
      alert('Недостаточно прав для изменения существующих промокодов.');
      return;
    }

    this.promoService.updatePromo(promo.code, promo.discount, promo.created_at).subscribe();
  }

  removeGame(gameID: number) {
    this.gameService.deleteGame(gameID, this.user!.id).subscribe({
      next: res => alert(res.message),
      error: err => alert(`Ошибка сервера: ${err.message || err}`)
    });
  }

  ngOnDestroy() { this.subClean(); }
}