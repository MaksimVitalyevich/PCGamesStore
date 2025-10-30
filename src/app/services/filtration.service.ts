import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltrationService {
  private filterToggleSource = new Subject<void>();
  filterToogle$ = this.filterToggleSource.asObservable();
  
  toggleFilter() { this.filterToggleSource.next(); }
}
