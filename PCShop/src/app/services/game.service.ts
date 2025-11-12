import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Game } from '../models/game.model';
import { CartItem } from '../models/cart.model';
import { CartService } from './cart.service';

@Injectable({ providedIn: 'root' })

export class GameService extends BaseApiService<Game> {
    private readonly GAME_API = "http://localhost:3000/PHPApp/api/games.php";

    constructor(http: HttpClient) { super(http, "http://localhost:3000/PHPApp/api/games.php"); }

    /** Получить список игр (через сервер) */
    getGames(): Observable<Game[]> {
      return this.http.get<{ success: boolean; games: Game[]}>(`${this.GAME_API}?action=getGames`).pipe(map(res => 
        (res.success ? res.games : [])));
    }

    /** Покупка игры (через сервер) */
    buyGame(userId: number, gameId: number): Observable<any> {
      return this.http.post<{ success: boolean; message?: string, cart?: CartItem[] }>(`${this.GAME_API}?action=buy`, { user_id: userId, game_id: gameId });
    }
}
