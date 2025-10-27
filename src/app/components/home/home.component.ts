import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game.model';
import { GameService } from '../../services/game.service';
import { CartService } from '../../services/cart.service';
import { PurchaseService } from '../../services/purchase.service';
import { UserService } from '../../services/user.service';
import { UserRole } from '../../models/enumerators.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { purchaseFieldAnim, modalAnims, gameCardAnim, gameEditAnim } from '../../app.animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [purchaseFieldAnim, modalAnims, gameCardAnim, gameEditAnim]
})
export class HomeComponent {
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
  isEditing = false;

  constructor(
    private fb: FormBuilder, 
    private gameService: GameService, 
    private cartService: CartService,
    private purchaseService: PurchaseService, 
    private userService: UserService
  ) { }

  ngOnInit() {
    this.gameService.game$.subscribe(games => {
      this.games = games;
      this.filteredGames = games;
    });
    this.userService.role$.subscribe(role => this.role = role);
    this.purchaseService.purchases$.subscribe((list) => this.purchased = list);
  }

  /** Открыть модальное окно с подробностями */
  openModal(game: Game) {
    this.selectedGame = game;
    this.isEditing = false;
    this.showModal = true;
  }

  /** Переключение в режим редактирования */
  editGame(updated: Game) {
    if (!this.userService.isAuthenticated()) return alert('Требуется войти в систему!');
    this.selectedGame = updated;
    this.isEditing = true;
    this.showModal = true;

    this.gameForm = this.fb.group({
      title: [updated.title, Validators.required],
      genre: [updated.genre, Validators.required],
      price: [updated.price, [Validators.required, Validators.min(0)]],
      systemRequirements: [updated.systemRequirements],
      developer: [updated.developer],
      companyName: [updated.companyName],
      localization: [updated.localization]
    });
  }

  /** Добавление игры  */
  addNewGame() {
    if (!this.userService.isAuthenticated()) return alert('Требуется войти в систему!');
    this.isEditing = true;
    this.selectedGame = null;
    this.showModal = true;

    this.gameForm = this.fb.group({
      title: ['', Validators.required],
      genre: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      systemRequirements: [''],
      developer: [''],
      companyName: [''],
      localization: ['']
    });
  }

  deleteGame(gameID: number) {
    this.gameService.removeGame(gameID);
    alert(`Удалена игра: ${gameID}`);
  }

  /** Сохранение изменении */
  saveChanges() {
    if (this.gameForm.invalid) return;

    if (this.selectedGame) {
      // Редактируем существующее
      const idx = this.games.findIndex(g => g.id === this.selectedGame!.id);
      this.games[idx] = { ...this.games[idx], ...this.gameForm.value };
    } else {
      // Добавляем новую
      const newGame: Game = {
        id: this.games.length + 1,
        ...this.gameForm.value
      };
      this.games.push(newGame);
    }

    this.closeModal();
  }

  /** Добавить игру в корзину */
  buyGame(game: Game) {
    if (!this.userService.isAuthenticated()) {
      alert('Только авторизованные пользователи могут покупать игры!');
      return;
    }

    this.cartService.addItem(game);
    alert(`Игра "${game.title}" добавлена в вашу корзину!`);
    this.purchaseService.addPurchase(game);
  }
  isPurchasedAlready(gameID: number) { return this.purchaseService.hasPurchased(gameID); }

  /** закрытие модального окна */
  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.selectedGame = null;
  }
}
