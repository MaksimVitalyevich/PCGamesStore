import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
export abstract class BaseApiService<T> {
  protected items$ = new BehaviorSubject<T[]>([]);
  readonly data$ = this.items$.asObservable();

  constructor(protected http: HttpClient, protected endpoint?: string) { }

  /** Получить все элементы */
  getALL(): Observable<T[]> {
    return this.http.get<{ success: boolean; [key: string]: any }>(`${this.endpoint}?action=getAll`).pipe(map(res => 
      (res.success ? (res['games'] ?? res['items'] ?? []) as T[]: [])),
      tap(list => this.items$.next(list))
    );
  }

  /** Получить по ID */
  getByID(id: number): Observable<T | null> {
    return this.http.get<{ success: boolean; item?: T}>(`${this.endpoint}?action=get&id=${id}`).pipe(map(res => 
      (res.success ? res.item ?? null : null)));
  }

  /** Добавить элемент */
  add(data: Partial<T>): Observable<any> {
    return this.http.post<{ success: boolean; message?: string}>(`${this.endpoint}?action=add`, data).pipe(tap(() => 
      this.getALL()));
  }

  /** Обновить элемент */
  update(data: T): Observable<any> {
    return this.http.post<{ success: boolean; message?: string}>(`${this.endpoint}?action=update`, data).pipe(tap(() => 
    this.getALL()));
  }

  /** Удаление по ID */
  delete(id: number): Observable<any> {
    return this.http.post<{ success: boolean; message?: string}>(`${this.endpoint}?action=delete`, { id }).pipe(tap(() => 
    this.getALL()));
  }
}
