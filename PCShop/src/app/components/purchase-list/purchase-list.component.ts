import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { PurchaseService } from '../../services/purchase.service';
import { FiltrationService } from '../../services/filtration.service';
import { UserService } from '../../services/user.service';
import { PurchaseItem } from '../../models/purchase.model';
import { User } from '../../models/user.model';
import { GameFiltersComponent } from '../game-filters/game-filters.component';
import { purchaseFieldAnim, gameCardAnim } from '../../app.animations';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, GameFiltersComponent],
  templateUrl: './purchase-list.component.html',
  styleUrl: './purchase-list.component.scss',
  animations: [purchaseFieldAnim, gameCardAnim]
})
export class PurchaseListComponent extends Unsubscriber implements OnInit, OnDestroy {
  purchases: PurchaseItem[] = [];
  user: User | null = null;
  currentPage = 1;
  pageSize = 6;
  showFilters = false;
  isLoading = true;
  hoveredCard: any = null;

  constructor(
    private purchaseService: PurchaseService, 
    private filterService: FiltrationService, 
    private userService: UserService
  ) { super(); }

  ngOnInit() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) this.purchaseService.getPurchases(user.id).subscribe();
    });
    this.purchaseService.purchases$.pipe(takeUntil(this.destroy$)).subscribe(list => { 
      this.purchases = list;
      
      this.currentPage = 1;
      setTimeout(() => this.isLoading = false, 1000);
    });
    this.filterService.filterToogle$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentPage = 1;
    });
    this.filterService.resetFilters();
  }

  toggleFilters(filters: any) { this.filterService.updateFilters(filters); }
  closeFiltersModal() { this.showFilters = false; }
  resetAllFilters() { this.filterService.resetFilters(); }

  get filteredPurchases(): PurchaseItem[] { return this.purchases.filter(p => this.filterService.applyFilters(p)); }
  get pagedPurchases(): PurchaseItem[] { 
    const start = (this.currentPage - 1) * this.totalPages;
    return this.filteredPurchases.slice(start, start + this.pageSize);
  }
  get totalPages(): number { return Math.ceil(this.filteredPurchases.length / this.pageSize); }

  goToPage(page: number) { if (page >= 1 && page <= this.totalPages) this.currentPage = page; }

  trackById(index: number, purchased_item: PurchaseItem) { return purchased_item.id }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  
  ngOnDestroy() { this.subClean(); }
}