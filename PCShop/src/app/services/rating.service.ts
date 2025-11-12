import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private ratingSource = new BehaviorSubject<Record<string, number>>(
    JSON.parse(localStorage.getItem('rating') || '{}')
  );
  rating$ = this.ratingSource.asObservable();

  /** Устанавливает рейтинг (Название, если есть + значение) */
  setRating(gameTitle: string | any, value: number): void {
    const updated = { ...this.ratingSource.value, [gameTitle]: value };
    this.ratingSource.next(updated);
    localStorage.setItem('rating', JSON.stringify(updated));
  }

  /** Получение рейтинга для реактивного обновления в UI */
  getRating$(gameTitle: string): Observable<number> {
    return this.ratingSource.pipe(map(r => r[gameTitle] ?? 0));
  }

  /** Для визуализации (UI) самого шаблона рейтинга (по названию игры) */
  getStars$(gameTitle: string): Observable<string> {
    return this.getRating$(gameTitle).pipe(map(r => this.generateStars(r)));
  }

  private generateStars(rating: number): string {
    const total = 10;
    const filled = Math.round(rating);
    return '★'.repeat(filled) + '☆'.repeat(total - filled);
  }
}
