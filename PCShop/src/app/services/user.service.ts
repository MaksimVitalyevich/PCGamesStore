import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { BehaviorSubject, Observable, of} from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserRole } from '../models/enumerators.model';
import { User } from '../models/user.model';
import { BalanceService } from './balance.service';
import { PurchaseService } from './purchase.service';

@Injectable({ providedIn: 'root' })

export class UserService extends BaseApiService<User> {
  private readonly USER_API = "http://localhost:3000/PHPApp/api/users.php";

  private userSource = new BehaviorSubject<User | null>(null);
  user$ = this.userSource.asObservable();
  private roleSource = new BehaviorSubject<UserRole | null>(null);
  role$ = this.roleSource.asObservable();

  constructor(
    http: HttpClient,
    private balanceService: BalanceService, 
    private purchaseService: PurchaseService
  ) {
    super(http, "http://localhost:3000/PHPApp/api/users.php");
    this.purchaseService.purchaseCompleted.subscribe((purchases) => {
      if (!this.user) return;
      this.user.purchases = purchases;
    });
  }

  /** Загрузка списка пользователей из локального .json */
  getUsers(): Observable<User[]> {
    return this.http.get<{ success: boolean; users: User[]}>(`${this.USER_API}?action=getUsers`).pipe(map(res => 
      (res.success ? res.users : [])));
  }

  set user(user: User) { this.user = user; }
  /** Возврат текущего пользователя (если вошел) */
  get user(): User | null { return this.userSource.value; }

  /** Проверка на авторизацию пользователя */
  isAuthenticated(): boolean { return !!this.user; }

  /** Обновление аватара пользователя */
  updateUserAvatar(avatarURL: string): void {
    const current = this.userSource.value;
    if (!current) return;

    const updated = { ...current, avatarURL };
    this.userSource.next(updated);

    localStorage.setItem('user', JSON.stringify(updated));
  }

  /** Сохранение с обновлением настроек профиля */
  updateProfile(profileData: Partial<User>): void {
    const user = this.user;
    if (!user) return;

    const updatedUser = { ...user, ...profileData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.userSource.next(updatedUser);
  }

  /** Нормализация тел. номера: +7 (XXX) XXX XX XX -> 8XXXXXXXXXX */
  private normalizePhone(input: string): number {
    if (!input) return 0;
    let digits = input.replace(/\D/g, '');
    if (digits.startsWith('7')) digits = '8' + digits.slice(1);
    return Number(digits);
  }

  /** Вход в систему (либо локально, либо по PHP API) */
  login(credentials: { username: string; password: string }): Observable<User | null> {
    console.log('Login payload:', credentials);
    if (!credentials) return of(null);

    return this.http.post<{ success: boolean; user?: User}>(`${this.USER_API}?action=login`, credentials).pipe(map(res => 
      (res.success ? res.user ?? null : null)
    ), tap(user => this.userSource.next(user)));
  }

  /** Быстрый логин (выполняется по имени пользователя) */
  quickLogin(username: string): Observable<User | null> {
    return this.getUsers().pipe(map(users => users.find(u => u.username.toLowerCase() === username.toLowerCase()) ?? null),
    tap(user => {
      if (user) {
        const normalizedRole = (user.role as string)?.toLowerCase() as UserRole;
        const normalizedUser = { ...user, role: normalizedRole };

        this.userSource.next(normalizedUser);
        this.roleSource.next(normalizedRole);
        this.balanceService.setBalance(normalizedUser.balance);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      }
    }));
  }

  /** Регистрация нового пользователя */
  register(credentials: { username: string, password: string, email: string, phone: string }): Observable<User | null> {
    console.log('Register payload:', credentials);
    const normalizedPhone = this.normalizePhone(credentials.phone);

    return this.http.post<{ success: boolean; user?: User }>(`${this.USER_API}?action=register`, { ...credentials, phone: normalizedPhone }).pipe(map(res =>
      res.success && res.user ? res.user : null), tap(user => {
        if (user) {
          this.userSource.next(user);
          this.roleSource.next(user.role);
          this.balanceService.setBalance(user.balance);
        }
      })
    );
  }

  /** Выход из системы */
  logout(): void { this.userSource.next(null); }
}
