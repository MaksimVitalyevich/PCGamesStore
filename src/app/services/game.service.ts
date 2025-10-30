import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../models/game.model';
import { defaultGames } from '../models/games-list.model';

@Injectable({ providedIn: 'root' })

export class GameService {
  private gameSource = new BehaviorSubject<Game[]>([]);
  game$ = this.gameSource.asObservable();

  constructor() {
    const saved = localStorage.getItem('games');
    if (saved) {
      this.gameSource.next(JSON.parse(saved));
    } else {
      this.gameSource.next(defaultGames);
      localStorage.setItem('games', JSON.stringify(defaultGames));
    }
  }

  getGames(): Game[] { return this.gameSource.value; }

  updateGameImage(imageURL: string) {
    const current = this.gameSource.value;
    if (!current) return;

    const updated = { ...current, imageURL }
    this.gameSource.next(updated);

    localStorage.setItem('games', JSON.stringify(updated));
  }

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
    localStorage.removeItem('games');
    this.gameSource.next(games);
    localStorage.setItem('games', JSON.stringify(games));
  }
}
