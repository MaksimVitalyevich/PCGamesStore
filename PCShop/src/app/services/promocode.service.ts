import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { Promocode } from '../models/promocode.model';
import { environment } from '../urls-environment';

@Injectable({ providedIn: 'root' })
export class PromocodeService extends BaseApiService<Promocode> {
  private PROMOCODE_API = environment.api.promocodes;
  private promocodeSource = new BehaviorSubject<Promocode[]>([]);
  promo$ = this.promocodeSource.asObservable();
  private promoStateSource = new BehaviorSubject<Promocode | null>(null);
  selectedPromo$ = this.promoStateSource.asObservable();

  constructor(http: HttpClient) { super(http, environment.api.promocodes) }

  setPromo(promo: Promocode | null): void { this.promoStateSource.next(promo); }
  get selectedPromo(): Promocode | null { return this.promoStateSource.value; }

  getPromocodes(): Observable<Promocode[]> {
    return this.http.get<{ success: boolean; promocodes: Promocode[] }>(
      `${this.PROMOCODE_API}?action=getPromocodes`
    ).pipe(map(res => res.success ? res.promocodes : []),
      tap(promosList => this.promocodeSource.next(promosList))
    );
  }

  checkCode(code: string): Observable<any> {
    return this.http.post<{ success: boolean; message?: string; discount?: number }>(`${this.PROMOCODE_API}?action=checkPromo`, { code: code }).pipe(map(res => ({
      success: res.success,
      discount: res.discount,
      message: res.message
    })));
  }

  addPromo(code: string, discount: number, added: Date): Observable<any> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.PROMOCODE_API}?action=addPromo`, { code: code, discount: discount, created_at: added }).pipe(switchMap(() =>
      this.getPromocodes()));
  }

  updatePromo(code: string, discount: number, added: Date): Observable<any> {
    return this.http.post<{ success: boolean; message?: string}>(`${this.PROMOCODE_API}?action=updatePromo`, { code: code, discount: discount, created_at: added }).pipe(switchMap(() => 
      this.getPromocodes()));
  }

  applyCode(userId: number, code: string): Observable<any> {
    return this.http.post<{ success: boolean; message?: string; discount: number }>(`${this.PROMOCODE_API}?action=apply`, { user_id: userId, code: code }).pipe(map(res => ({
      success: res.success,
      discount: res.discount,
      message: res.message
    })), tap(res => {
      if (res.success) this.getPromocodes().subscribe();
    }), catchError(() => of({ success: false, message: 'Ошибка применения промокода'})));
  }

  reactivateCode(code: string): Observable<any> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.PROMOCODE_API}?action=reactivate`, { code: code }).pipe(tap(() => 
    this.getPromocodes().subscribe()), catchError(() => of({ success: false, message: 'Ошибка реактивации'})));
  }

  resetUsage(code: string): Observable<any> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.PROMOCODE_API}?action=reset_usage`, { code: code }).pipe(tap(() => 
    this.getPromocodes().subscribe()), catchError(() => of({ success: false, message: 'Ошибка сброса пользования'})));
  }

  deactivateCode(code: string): Observable<any> {
    return this.http.post<{ success: boolean; message?: string }>(`${this.PROMOCODE_API}?action=deactivate`, { code: code }).pipe(tap(() => 
    this.getPromocodes().subscribe()), catchError(() => of({ success: false, message: 'Ошибка деактивации'})));
  }

  clearPromo(): void { this.promoStateSource.next(null); }
}
