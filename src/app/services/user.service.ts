import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { User, Theme } from '../models/user.model';
import { Game } from '../models/game.model';

export enum PayMethod {
  Card = 'card',
  Promo = 'promo'
}

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private userSource = new BehaviorSubject<User | null>(null);
  user$ = this.userSource.asObservable();

  private balanceSource = new BehaviorSubject<number>(0);
  balance$ = this.balanceSource.asObservable();

  private purchasesSource = new BehaviorSubject<Game[]>([]);
  purchases$ = this.purchasesSource.asObservable();

  private themeSource = new BehaviorSubject<Theme>(Theme.Light);
  theme$ = this.themeSource.asObservable();

  private readonly API_URL = 'http://localhost/PHPApp/api/users.php';


  constructor(private http: HttpClient) {
    // Загрузка пользователя (если уже имеется)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser) as User;
      this.userSource.next(user);
      this.balanceSource.next(user.balance ?? 2500);
      this.purchasesSource.next(user.purchases ?? []);
      this.themeSource.next(user.theme ?? Theme.Light);
    }
  }

  /** Возврат текущего пользователя (если вошел) */
  get user(): User | null {
    return this.userSource.value;
  }

  /** Проверка на авторизацию пользователя */
  isAuthenticated(): boolean {
    return !!this.user;
  }

  /** Получение баланса пользователя */
  getBalance(): number {
    return this.balanceSource.value;
  }

  /** Проверка на достаточность средств */
  canAfford(amount: number): boolean {
    return this.getBalance() >= amount;
  }

  /** Обновление баланса */
  updateBalance(amount: number): void {
    const current = this.getBalance();
    const newBalance = Math.max(0, current - amount);

    this.balanceSource.next(newBalance);

    const user = this.user
    if (user) {
      user.balance = newBalance;
      localStorage.setItem('user', JSON.stringify(user));
      this.userSource.next(user);
    }
  }

  /** Сохранение с обновлением настроек профиля */
  updateProfile(profileData: any): void {
    
  }

  /** Настройка темы профиля */
  setTheme(theme: Theme): void {
    this.themeSource.next(theme);
  }

  /** Нормализация тел. номера: +7 (XXX) XXX XX XX -> 8XXXXXXXXXX */
  private normalizePhone(input: string): number {
    if (!input) return 0;

    let digits = input.replace(/\D/g, '');

    if (digits.startsWith('7')) {
      digits = '8' + digits.slice(1);
    }

    return Number(digits);
  }

  /** Вход в систему (либо локально, либо по PHP API) */
  login(username: string, password: string): Observable<User | null> {
    if (!username || !password) return of(null);

    return this.http.post<User | null>(`${this.API_URL}?action=login`, { username, password}).pipe(tap(user => {
      if (user) {
        this.userSource.next(user);
        this.balanceSource.next(user.balance ?? 2500);
        localStorage.setItem('user', JSON.stringify(user));
      }
    }), catchError(err => {
      console.error('Ошибка входа:', err);
      return of(null);
    }));
  }

  /** Регистрация нового пользователя */
  register(username: string, password: string, email: string, phone: string): Observable<User | null> {
    const normalizedPhone = this.normalizePhone(phone);
    const rebuildData = { username, password, email, phone: normalizedPhone, balance: 2500 };

    return this.http.post<User | null>(`${this.API_URL}?action=register`, rebuildData).pipe(tap(user => {
      if (user) {
        this.userSource.next(user);
        this.balanceSource.next(user.balance ?? 2500);
        localStorage.setItem('user', JSON.stringify(user));
      }
    }), catchError(err => {
      console.error('Ошибка регистрации:', err);
      return of(null);
    }));
  }

  /** Выход из системы */
  logout(): void {
    this.userSource.next(null);
    localStorage.removeItem('user');
  }
}
