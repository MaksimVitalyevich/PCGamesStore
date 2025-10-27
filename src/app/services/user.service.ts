import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Theme, UserRole } from '../models/enumerators.model';
import { User } from '../models/user.model';
import { BalanceService } from './balance.service';
import { PurchaseService } from './purchase.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private userSource = new BehaviorSubject<User | null>(null);
  user$ = this.userSource.asObservable();

  private usersCache: User[] = [];

  private roleSource = new BehaviorSubject<UserRole | null>(null);
  role$ = this.roleSource.asObservable();

  private themeSource = new BehaviorSubject<Theme>(Theme.Light);
  theme$ = this.themeSource.asObservable();

  private readonly API_URL = 'http://localhost/PHPApp/api/users.php';
  private readonly MOCK_MODE = true;

  constructor(
    private http: HttpClient, 
    private balanceService: BalanceService, 
    private purchaseService: PurchaseService
  ) {
    this.purchaseService.purchaseCompleted.subscribe((purchases) => {
      if (!this.user) return;
      this.user.purchases = purchases;
    });
  }

  /** Загрузка списка пользователей из savedRoles.json */
  loadUsersFromFile(): Observable<User[]> {
    return this.http.get<any>('data/savedRoles.json').pipe(map(data => {
      const all: User[] = [];

      const parseGroup = (group: any): User[] => Object.values(group).map((u: any) => ({
        id: +u.id,
        username: u.username,
        password: u.password,
        email: u.email,
        phone: u.phone,
        balance: +u.balance,
        purchases: [],
        created_at: new Date(u.created_at),
        role: u.role
      }));

      if (data.moderators) all.push(...parseGroup(data.moderators));
      if (data.users) all.push(...parseGroup(data.users));
      if (data.premium) all.push(...parseGroup(data.premium));

      this.usersCache = all;
      localStorage.setItem('users', JSON.stringify(all));
      return all;
    }), tap(() => console.log('Пользователи загружены:', this.usersCache)));
  }

  set user(user: User) { this.user = user; }
  /** Возврат текущего пользователя (если вошел) */
  get user(): User | null { return this.userSource.value; }
  /** Взврат текущей роли пользователя */
  get role(): UserRole | null { return this.roleSource.value; }

  /** Проверка на авторизацию пользователя */
  isAuthenticated(): boolean { return !!this.user; }

  /** Проверка роли пользователя (Модератор) */
  isModerator(): boolean { return this.role === UserRole.Moderator }
  /** Проверка роли пользователя (Обычный пользователь) */
  isUser(): boolean { return this.role === UserRole.User }
  /** Проверка роли пользователя (Премиум, VIP) */
  isPremiumUser(): boolean { return this.role === UserRole.PremiumUser }

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

  /** Настройка темы профиля */
  setTheme(theme: Theme): void { this.themeSource.next(theme); }

  /** Нормализация тел. номера: +7 (XXX) XXX XX XX -> 8XXXXXXXXXX */
  private normalizePhone(input: string): number {
    if (!input) return 0;
    let digits = input.replace(/\D/g, '');
    if (digits.startsWith('7')) digits = '8' + digits.slice(1);
    return Number(digits);
  }

  /** Вход в систему (либо локально, либо по PHP API) */
  login(username: string, password: string): Observable<User | null> {
    if (!username || !password) return of(null);

    if (this.MOCK_MODE) {
      const savedTestUser = localStorage.getItem('user');
      if (savedTestUser) {
        const user = JSON.parse(savedTestUser) as User;
        if (user.username === username && user.password === password) {
          this.userSource.next(user);
          this.roleSource.next(user.role ?? UserRole.User);
          this.balanceService.setBalance(user.balance);
          return of(user);
        }
      }
    } else {
      return this.http.post<User | null>(`${this.API_URL}?action=login`, { username, password}).pipe(tap(user => {
        if (user) {
          this.userSource.next(user);
          this.roleSource.next(user.role ?? UserRole.User);
          this.balanceService.setBalance(user.balance ?? 2000);
          localStorage.setItem('user', JSON.stringify(user));
        }
      }), catchError(err => {
        console.error('Ошибка входа:', err);
        return of(null);
      }));
    }
    return of(null);
  }

  /** Быстрый логин (выполняется по имени пользователя) */
  quickLogin(username: string): Observable<User | null> {
    const user = this.usersCache.find(u => u.username.toLowerCase() === username.toLowerCase());
    console.log('Найденный пользователь (текущий):', username, '->', user);
    if (user) {
      const normalizedRole = (user.role as string)?.toLowerCase() as UserRole;
      const normalizedUser = { ...user, role: normalizedRole}

      this.userSource.next(normalizedUser);
      this.roleSource.next(normalizedRole);
      this.balanceService.setBalance(normalizedUser.balance);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return of(normalizedUser);
    }
    return of(null);
  }

  /** Регистрация нового пользователя */
  register(username: string, password: string, email: string, phone: string): Observable<User | null> {
    const normalizedPhone = this.normalizePhone(phone);
    const rebuildData = { username, password, email, phone: normalizedPhone, balance: 2500 };

    if (this.MOCK_MODE) {
      const testUser: User = {
        id: Math.floor(Math.random() * 10000),
        username,
        password,
        email,
        phone: normalizedPhone,
        balance: 2000,
        purchases: [],
        role: UserRole.User,
        created_at: new Date()
      };

      localStorage.setItem('user', JSON.stringify(testUser));
      this.userSource.next(testUser);
      this.roleSource.next(testUser.role);
      this.balanceService.setBalance(testUser.balance);
      return of(testUser);
    } else {
      return this.http.post<User | null>(`${this.API_URL}?action=register`, rebuildData).pipe(tap(user => {
        if (user) {
          this.userSource.next(user);
          this.roleSource.next(user.role);
          this.balanceService.setBalance(user.balance ?? 2000);
          localStorage.setItem('user', JSON.stringify(user));
        }
      }), catchError(err => {
        console.error('Ошибка регистрации:', err);
        return of(null);
      }));
    }
  }

  /** Выход из системы */
  logout(): void {
    this.userSource.next(null);
    this.roleSource.next(null);
    localStorage.removeItem('user');
    this.balanceService.setBalance(0);
    this.purchaseService.clearPurchases();
  }
}
