import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { Game } from '../models/game.model';
import { CartItem } from '../models/cart.model';
import { CartService } from './cart.service';
import { PurchaseService } from './purchase.service';
import { environment } from '../urls-environment';

@Injectable({ providedIn: 'root' })

export class GameService extends BaseApiService<Game> {
    private readonly GAME_API = environment.api.games;

    constructor(
      http: HttpClient, 
      private cartService: CartService, 
      private purchaseService: PurchaseService
    ) { super(http, environment.api.games); }

    /** Получить список игр (через сервер) */
    getGames(): Observable<Game[]> {
      return this.http.get<{ success: boolean; games: Game[]}>(`${this.GAME_API}?action=getGames`).pipe(map(res => 
        res.success ? res.games : []), tap(gamesList => this.items$.next(gamesList)));
    }

    addGame(game: Game): Observable<Game[]> {
      const payload = {
        id: game.id,
        title: game.title,
        genre: game.genre,
        rating: game.rating,
        price: game.price
      };

      return this.http.post<{ success: boolean; game?: Game }>(`${this.GAME_API}?action=addGame`, { data: payload }).pipe(switchMap(() => 
      this.getGames()));
    }

    updateGame(game: Game): Observable<Game[]> {
      const payload = {
        id: game.id,
        title: game.title,
        genre: game.genre,
        rating: game.rating,
        price: game.price
      };
      console.log(JSON.stringify(payload));

      return this.http.post<{ success: boolean; game?: Game }>(`${this.GAME_API}?action=updateGame`, { data: payload }).pipe(switchMap(() => 
      this.getGames()));
    }

    deleteGame(gameID: number, userId: number): Observable<any> {
      return this.http.post<{ success: boolean; message?: string }>(`${this.GAME_API}?action=deleteGame`, { id: gameID }).pipe(switchMap(res => {
        if (!res.success) return of(res);
        return this.cartService.removefromCart(gameID, userId).pipe(switchMap(() => this.getGames()), map(() => ({
          success: true, message: `Удалена игра: ${gameID}` })));
      }));
    }

    /** Покупка игры (через сервер) */
    buyGame(userId: number, gameId: number): Observable<any> {
      return this.http.post<{ success: boolean; message?: string, cart?: CartItem[] }>(`${this.GAME_API}?action=buy`, { user_id: userId, game_id: gameId }).pipe(tap(res => {
        if (res.success) {
          this.cartService.refreshCart(userId);
          this.purchaseService.addPurchasedIds(gameId);
        }
      }));
    }
}
