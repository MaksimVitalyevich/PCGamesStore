import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../models/game.model';

@Injectable({ providedIn: 'root' })

export class GameService {
  private gameSource = new BehaviorSubject<Game[]>([]);
  game$ = this.gameSource.asObservable();

  constructor() {
    const saved = localStorage.getItem('games');
    if (saved) {
      this.gameSource.next(JSON.parse(saved));
    } else {
      const defaultGames: Game[] = [
        {
          id: 1, title: "Cyberpunk 2077", published_at: new Date(2023), genre: "Action / RPG", systemRequirements: "Windows 10, 8GB RAM, GTX 1060",
          price: 1999, image: 'games/cyberpunk.webp', developer: "CD Projekt RED", companyName: "CD Projekt", localization: "RU / ENG"
        },
        {
          id: 2, title: "Half-Life: Alyx", published_at: new Date(2020), genre: "Sci-Fi / Shooter", systemRequirements: "Windows 10, 12GB RAM, RTX 2060",
          price: 2499, image: 'games/half-life-alyx.webp', developer: "Valve", companyName: "Valve Software", localization: "RU / ENG"
        },
        {
          id: 3, title: "Red Dead Redemption 2", published_at: new Date(2019), genre: "Action / Adventure", systemRequirements: "Windows 7/8/10, 8GB RAM, GTX 770",
          price: 2599, image: 'games/rd-redemption-two.webp', developer: "Rockstar Games", companyName: "Take-Two Interactive", localization: "RU / ENG"
        },
        {
          id: 4, title: "Counter Strike - 2", published_at: new Date(2023), genre: "Action / Shooter", systemRequirements: "Windows 10/11, 1GB RAM, GeForce 7600 GT",
          price: 1520, image: 'games/cs-two.webp', developer: "Valve", companyName: "Valve Software", localization: "RU / ENG"
        },
        {
          id: 5, title: "Postal 4: No Regrets", published_at: new Date(2022), genre: "Action / Adventure", systemRequirements: "Windows 10/11, 8GB RAM, DirectX 11",
          price: 1300, image: 'games/postal-four.webp', developer: "Running With Scissors", companyName: "Running With Scissors", localization: "RU / ENG"
        },
        {
          id: 6, title: "Doom Eternal", published_at: new Date(2020), genre: "Action / Shooter", systemRequirements: "Windows 7/8/10, 8GB RAM, GeForce 1050 Ti / AMD Radeon R9 280",
          price: 1660, image: 'games/doom-eternal.webp', developer: "ID Software", companyName: "Bethesda Softworks", localization: "RU / ENG"
        },
        {
          id: 7, title: "Borderlands 3", published_at: new Date(2020), genre: "RPG / Shooter", systemRequirements: "Windows 7/8/10, 6GB RAM, AMD Radeon 7970 HD",
          price: 1255, image: 'games/borderlands-three.webp', developer: "Gearbox Software", companyName: "2K Games", localization: "RU / ENG"
        },
        {
          id: 8, title: "Back 4 Blood", published_at: new Date(2021), genre: "Horror / Shooter", systemRequirements: "Windows 10/11, 8GB RAM, GeForce GTX 1050 Ti / AMD Radeon RX 570",
          price: 2299, image: 'games/back-for-blood.webp', developer: "Turtle Rock Studios", companyName: "Warner Bros. Games", localization: "RU / ENG"
        },
        {
          id: 9, title: "Garrys Mod", published_at: new Date(2024), genre: "Simulator / Sandbox", systemRequirements: "Windows XP/Vista/7/8/10, 512MB RAM, DirectX 8",
          price: 1100, image: 'games/garrys-mod.webp', developer: "Valve", companyName: "Valve Software", localization: "RU / ENG"
        },
        {
          id: 10, title: "Serious Sam 4", published_at: new Date(2020), genre: "Adventure / Shooter", systemRequirements: "Windows 7/8/10, 8GB RAM, GeForce 1050 / AMD Radeon 7950 / DirectX 11",
          price: 1449, image: 'games/serious-sam-four.webp', developer: "Croteam", companyName: "Devolver Digital", localization: "RU / ENG"
        },
        {
          id: 11, title: "Grand Theft Auto 5", published_at: new Date(2015), genre: "Open World / Action", systemRequirements: "Windows Vista/7/8/10, 4GB RAM, GT 9800 / AMD 4870 HD",
          price: 960, image: 'games/gta-five.webp', developer: "Rockstar North", companyName: "Rockstar Games", localization: "RU / ENG"
        }
      ];
      this.gameSource.next(defaultGames);
      localStorage.setItem('games', JSON.stringify(defaultGames));
    }
    
  }

  getGames(): Game[] { return this.gameSource.value; }

  addGame(game: Game): void {
    const updated = [...this.getGames(), game];
    this.updateStorage(updated);
  }

  updateGame(id: number, data: Partial<Game>): void {
    const updated = this.getGames().map(g => g.id === id ? { ...g, ...data } : g);
    this.updateStorage(updated);
  }

  removeGame(id: number): void {
    const updated = this.getGames().filter(g => g.id !== id);
    this.updateStorage(updated);
  }

  searchGame(term: string): Game[] {
    return this.getGames().filter(g => g.title.toLowerCase().includes(term.toLowerCase()));
  }

  private updateStorage(games: Game[]) {
    this.gameSource.next(games);
    localStorage.setItem('games', JSON.stringify(games))
  }
}
