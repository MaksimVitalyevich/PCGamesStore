import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { Game } from '../../models/game.model';
import { GameService } from '../../services/game.service';
import { CartService } from '../../services/cart.service';
import { PurchaseService } from '../../services/purchase.service';
import { UserService } from '../../services/user.service';
import { FiltrationService } from '../../services/filtration.service';
import { UserRole } from '../../models/enumerators.model';
import { GameFiltersComponent } from '../game-filters/game-filters.component';
import { purchaseFieldAnim, modalAnims, gameCardAnim, gameEditAnim } from '../../app.animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GameFiltersComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [purchaseFieldAnim, modalAnims, gameCardAnim, gameEditAnim]
})
export class HomeComponent extends Unsubscriber implements OnInit, OnDestroy {
  games: Game[] = [];
  purchased: Game[] = [];
  role: UserRole | null = null;
  filteredGames: Game[] = [];
  searchTerm = '';
  selectedGame: Game | null = null;
  hoveredCard: any = null;
  gameForm!: FormGroup;
  UserRole = UserRole;
  showModal = false;
  showFilters = false;
  isEditing = false;

  constructor(
    private fb: FormBuilder, 
    private gameService: GameService, 
    private cartService: CartService,
    private purchaseService: PurchaseService, 
    private userService: UserService,
    private filterService: FiltrationService
  ) { super(); }

  ngOnInit() {
    this.gameService.game$.pipe(takeUntil(this.destroy$)).subscribe(games => {
      this.games = games;
      this.filteredGames = [...games];
    });
    this.userService.role$.pipe(takeUntil(this.destroy$)).subscribe(role => this.role = role);
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(cartItems => {
      this.purchased = this.purchased.filter(p => cartItems.some(c => c.id === p.id));
    });
    this.purchaseService.purchases$.pipe(takeUntil(this.destroy$)).subscribe((list) => this.purchased = list);
    this.filterService.filterToogle$.pipe(takeUntil(this.destroy$)).subscribe(() => this.showFilters = !this.showFilters);

    console.log(this.games);
  }

  /** Проверка купленности самой игры */
  isPurchasedAlready(gameID: number) { return this.purchased.some(p => p.id === gameID); }

  /** Открыть модальное окно с подробностями */
  openModal(game: Game) {
    this.selectedGame = game;
    this.isEditing = false;
    this.showModal = true;
  }

  /** Фильтрация поиска (продвинутая) */
  onFiltersChanged(filters: any) {
    this.filteredGames = this.gameService.getGames().filter(game =>
      game.price >= filters.price[0] && game.price <= filters.price[1] &&
      game.rating >= filters.rating[0] && game.rating <= filters.rating[1] &&
      (filters.genre ? game.genre === filters.genre : true)
    );

    this.games = this.filteredGames;
  }

  onImageSelected(event: Event, chosenGame: Game) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const imageFile = input.files[0];
    const validTypes = ['image/webp', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(imageFile.type)) {
      alert('Недопустимый формат для изображения для обложки игры!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      chosenGame.image = reader.result as string;
      this.gameService.updateGameImage(chosenGame.image);
    };
    reader.readAsDataURL(imageFile);
  }

  /** Переключение в режим редактирования */
  editGame(updated: Game) {
    this.selectedGame = updated;
    this.isEditing = true;
    this.showModal = true;

    this.gameForm = this.fb.group({
      title: [updated.title, Validators.required],
      genre: [updated.genre, Validators.required],
      rating: [updated.rating, [Validators.required, Validators.minLength(0), Validators.maxLength(10)]],
      price: [updated.price, [Validators.required, Validators.min(0)]],
      systemRequirements: [updated.systemRequirements],
      developer: [updated.developer],
      companyName: [updated.companyName],
      localization: [updated.localization]
    });
  }

  /** Добавление игры  */
  addNewGame() {
    this.isEditing = true;
    this.selectedGame = null;
    this.showModal = true;

    this.gameForm = this.fb.group({
      title: ['', Validators.required],
      genre: ['', Validators.required],
      rating: [0, [Validators.required, Validators.minLength(0), Validators.maxLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      systemRequirements: [''],
      developer: [''],
      companyName: [''],
      localization: ['']
    });
  }

  deleteGame(gameID: number) {
    this.gameService.removeGame(gameID);
    this.cartService.removeItem(gameID);
    this.purchaseService.removePurchase(gameID);
    alert(`Удалена игра: ${gameID}`);
  }

  /** Сохранение изменении */
  saveChanges() {
    if (this.gameForm.invalid) return;

    if (this.selectedGame) {
      // Редактируем существующее
      this.gameService.updateGame(this.selectedGame.id, this.gameForm.value);
    } else {
      // Добавляем новую
      const newGame: Game = { id: this.games.length + 1, ...this.gameForm.value };
      this.gameService.addGame(newGame);
    }

    this.closeModal();
  }

  /** Добавить игру в корзину */
  buyGame(game: Game) {
    if (!this.userService.isAuthenticated()) {
      alert('Только авторизованные пользователи могут покупать игры!');
      return;
    }

    if (!this.isPurchasedAlready(game.id)) {
      this.cartService.addItem(game);
      this.purchaseService.addPurchase(game);
      alert(`Игра "${game.title}" добавлена в вашу корзину!`);
    }
  }

  /** закрытие модального окна */
  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.selectedGame = null;
  }

  ngOnDestroy() { this.subClean(); }
}
