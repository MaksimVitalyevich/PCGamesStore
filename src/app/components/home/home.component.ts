import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game.model';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  games: Game[] = [];
  selectedGame: Game | null = null;
  gameForm!: FormGroup;
  showModal = false;
  isEditing = false;

  constructor(private fb: FormBuilder, private cartService: CartService, private userService: UserService) { }

  ngOnInit() {
    this.games = [
      {
        id: 1,
        title: "Cyberpunk 2077",
        genre: "Action / RPG",
        systemRequirements: "Windows 10, 8GB RAM, GTX 1060",
        price: 1999,
        image: 'assets/images/cyberpunk.png',
        developer: "CD Projekt RED",
        companyName: "CD Projekt",
        localization: "RU / ENG"
      },
      {
        id: 2,
        title: "Half-Life: Alyx",
        genre: "Sci-Fi / Shooter",
        systemRequirements: "Windows 10, 12GB RAM, RTX 2060",
        price: 2499,
        image: 'assets/images/hlalyx.png',
        developer: "Valve",
        companyName: "Valve",
        localization: "RU / ENG"
      }
    ];
  }

  /** Открыть модальное окно с подробностями */
  openModal(game: Game) {
    this.selectedGame = game;
    this.isEditing = false;
    this.showModal = true;
  }

  /** Переключение в режим редактирования */
  editGame(game: Game) {
    if (!this.userService.isAuthenticated()) return alert('Требуется войти в систему!');
    this.selectedGame = game;
    this.isEditing = true;
    this.showModal = true;

    this.gameForm = this.fb.group({
      title: [game.title, Validators.required],
      genre: [game.genre, Validators.required],
      price: [game.price, [Validators.required, Validators.min(0)]],
      systemRequirements: [game.systemRequirements],
      developer: [game.developer],
      companyName: [game.companyName],
      localization: [game.localization]
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

    this.cartService.addToCart(game);
    alert(`Игра "${game.title}" добавлена в вашу корзину!`);
  }

  /** закрытие модального окна */
  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.selectedGame = null;
  }
}
