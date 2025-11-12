import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../models/game.model';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class FiltrationService {
  private filterToggleSource = new BehaviorSubject<any>({});
  filterToogle$ = this.filterToggleSource.asObservable();

  constructor(private gameService: GameService) { }

  /** Сохранение текущего состояния фильтров */
  updateFilters(filters: any): void {
    this.filterToggleSource.next(filters);
  }

  /** Проверка одной игры на соответствие фильтрам */
  applyFilters(game: Game): boolean {
    const filters = this.filterToggleSource.value;
    const price0 = Number(filters.price?.[0] ?? -Infinity);
    const price1 = Number(filters.price?.[1] ?? Infinity);
    const rating0 = Number(filters.rating?.[0] ?? -Infinity);
    const rating1 = Number(filters.rating?.[1] ?? Infinity);
    const genre = (filters.genres || '').toString().trim().toLowerCase();

    const gPrice = Number(game.price);
    const gRating = Number(game.rating);
    const gGenre = (game.genre || '').toLowerCase();

    const priceMatch = gPrice >= price0 && gPrice <= price1;
    const ratingMatch = gRating >= rating0 && gRating <= rating1;
    const genreMatch = !genre || gGenre.includes(genre);

    return priceMatch && ratingMatch && genreMatch;
  }

  /** Сброс фильтрации поиска */
  resetFilters(): void { this.filterToggleSource.next(this.gameService.getGames()); }
}
