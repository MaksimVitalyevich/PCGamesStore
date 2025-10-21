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
    // Тестовые данные. TODO: Заменить на БД данные MySQL!
    this.games = [
      {
        id: 1,
        title: "Cyberpunk 2077",
        published_at: new Date(2023),
        genre: "Action / RPG",
        systemRequirements: "Windows 10, 8GB RAM, GTX 1060",
        price: 1999,
        image: 'games/cyberpunk.webp',
        developer: "CD Projekt RED",
        companyName: "CD Projekt",
        localization: "RU / ENG"
      },
      {
        id: 2,
        title: "Half-Life: Alyx",
        published_at: new Date(2020),
        genre: "Sci-Fi / Shooter",
        systemRequirements: "Windows 10, 12GB RAM, RTX 2060",
        price: 2499,
        image: 'games/half-life-alyx.webp',
        developer: "Valve",
        companyName: "Valve Software",
        localization: "RU / ENG"
      },
      {
        id: 3,
        title: "Red Dead Redemption 2",
        published_at: new Date(2019),
        genre: "Action / Adventure",
        systemRequirements: "Windows 7/8/10, 8GB RAM, GTX 770",
        price: 2599,
        image: 'games/rd-redemption-two.webp',
        developer: "Rockstar Games",
        companyName: "Take-Two Interactive",
        localization: "RU / ENG"
      },
      {
        id: 4,
        title: "Counter Strike - 2",
        published_at: new Date(2023),
        genre: "Action / Shooter",
        systemRequirements: "Windows 10/11, 1GB RAM, GeForce 7600 GT",
        price: 1520,
        image: 'games/cs-two.webp',
        developer: "Valve",
        companyName: "Valve Software",
        localization: "RU / ENG"
      },
      {
        id: 5,
        title: "Postal 4: No Regrets",
        published_at: new Date(2022),
        genre: "Action / Adventure",
        systemRequirements: "Windows 10/11, 8GB RAM, DirectX 11",
        price: 1300,
        image: 'games/postal-four.webp',
        developer: "Running With Scissors",
        companyName: "Running With Scissors",
        localization: "RU / ENG"
      },
      {
        id: 6,
        title: "Doom Eternal",
        published_at: new Date(2020),
        genre: "Action / Shooter",
        systemRequirements: "Windows 7/8/10, 8GB RAM, GeForce 1050 Ti / AMD Radeon R9 280",
        price: 1660,
        image: 'games/doom-eternal.webp',
        developer: "ID Software",
        companyName: "Bethesda Softworks",
        localization: "RU / ENG"
      },
      {
        id: 7,
        title: "Borderlands 3",
        published_at: new Date(2020),
        genre: "RPG / Shooter",
        systemRequirements: "Windows 7/8/10, 6GB RAM, AMD Radeon 7970 HD",
        price: 1255,
        image: 'games/borderlands-three.webp',
        developer: "Gearbox Software",
        companyName: "2K Games",
        localization: "RU / ENG"
      },
      {
        id: 8,
        title: "Back 4 Blood",
        published_at: new Date(2021),
        genre: "Horror / Shooter",
        systemRequirements: "Windows 10/11, 8GB RAM, GeForce GTX 1050 Ti / AMD Radeon RX 570",
        price: 2299,
        image: 'games/back-for-blood.webp',
        developer: "Turtle Rock Studios",
        companyName: "Warner Bros. Games",
        localization: "RU / ENG"
      },
      {
        id: 9,
        title: "Garrys Mod",
        published_at: new Date(2024),
        genre: "Simulator / Sandbox",
        systemRequirements: "Windows XP/Vista/7/8/10, 512MB RAM, DirectX 8",
        price: 1100,
        image: 'games/garrys-mod.webp',
        developer: "Valve",
        companyName: "Valve Software",
        localization: "RU / ENG"
      },
      {
        id: 10,
        title: "Serious Sam 4",
        published_at: new Date(2020),
        genre: "Adventure / Shooter",
        systemRequirements: "Windows 7/8/10, 8GB RAM, GeForce 1050 / AMD Radeon 7950 / DirectX 11",
        price: 1449,
        image: 'games/serious-sam-four.webp',
        developer: "Croteam",
        companyName: "Devolver Digital",
        localization: "RU / ENG"
      },
      {
        id: 11,
        title: "Grand Theft Auto 5",
        published_at: new Date(2015),
        genre: "Open World / Action",
        systemRequirements: "Windows Vista/7/8/10, 4GB RAM, GT 9800 / AMD 4870 HD",
        price: 960,
        image: 'games/gta-five.webp',
        developer: "Rockstar North",
        companyName: "Rockstar Games",
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
