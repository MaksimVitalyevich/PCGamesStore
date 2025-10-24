import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game.model';
import { GameService } from '../../services/game.service';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserRole } from '../../models/enumerators.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  games: Game[] = [];
  filteredGames: Game[] = [];
  searchTerm = '';
  selectedGame: Game | null = null;
  gameForm!: FormGroup;
  showModal = false;
  isEditing = false;

  constructor(private fb: FormBuilder, private gameService: GameService, private cartService: CartService, private userService: UserService) { }

  ngOnInit() {
    this.gameService.game$.subscribe(games => {
      this.games = games;
      this.filteredGames = games;
    });
  }

  /** Открыть модальное окно с подробностями */
  openModal(game: Game) {
    this.selectedGame = game;
    this.isEditing = false;
    this.showModal = true;
  }

  /** Проверка роли пользователя (Модератор) */
  isModerator(): boolean { return this.userService.user?.role === UserRole.Moderator }
  /** Проверка роли пользователя (Обычный пользователь) */
  isUser(): boolean { return this.userService.user?.role === UserRole.User }
  /** Проверка роли пользователя (Премиум, VIP) */
  isPremiumUser(): boolean { return this.userService.user?.role === UserRole.PremiumUser }

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
  }

  /** закрытие модального окна */
  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.selectedGame = null;
  }
}
