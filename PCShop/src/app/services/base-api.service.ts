import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export abstract class BaseApiService<T> {
  protected items$ = new BehaviorSubject<T[]>([]);
  readonly data$ = this.items$.asObservable();

  constructor(protected http: HttpClient, protected endpoint?: string) { }

  /** Получить по ID */
  getByID(id: number): Observable<T | null> {
    return this.http.get<{ success: boolean; item?: T}>(`${this.endpoint}?action=get&id=${id}`).pipe(map(res => 
      (res.success ? res.item ?? null : null)));
  }
}
