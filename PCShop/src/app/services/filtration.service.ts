import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../models/game.model';
import { PurchaseItem } from '../models/purchase.model';
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
  applyFilters(item: Game | PurchaseItem): boolean {
    const filters = this.filterToggleSource.value;

    if ('price' in item && 'rating' in item && 'genre' in item) {
      const price0 = filters.price[0];
      const price1 = filters.price[1];
      const rating0 = filters.rating[0];
      const rating1 = filters.rating[1];
      const genre = (filters.genres || '').toString().trim().toLowerCase();

      const priceMatch = item.price >= price0 && item.price <= price1;
      const ratingMatch = item.rating >= rating0 && item.rating <= rating1;
      const genreMatch = !genre || (item.genre || '').includes(genre);

      return priceMatch && ratingMatch && genreMatch;
    }

    if ('purchase_date' in item && 'promo_used' in item) {
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(-8640000000000000);
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date(8640000000000000);
      const promoUsed = filters.promoUsed ?? null;

      const dateMatch = item.purchase_date >= dateFrom && item.purchase_date <= dateTo;
      const promoMatch = promoUsed === null || item.promo_used === promoUsed;

      return dateMatch && promoMatch;
    }

    return true; // ни один из соответствующих типов выше
  }

  /** Сброс фильтрации поиска */
  resetFilters(): void { this.filterToggleSource.next(this.gameService.getGames()); }
}
