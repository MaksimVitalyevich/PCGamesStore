import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { RatingService } from '../../services/rating.service';
import { PurchaseService } from '../../services/purchase.service';
import { FiltrationService } from '../../services/filtration.service';
import { PurchaseItem } from '../../models/purchase.model';
import { Game } from '../../models/game.model';
import { GameFiltersComponent } from '../game-filters/game-filters.component';
import { purchaseFieldAnim, gameCardAnim } from '../../app.animations';
declare var VanillaTilt: any;

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, GameFiltersComponent],
  templateUrl: './purchase-list.component.html',
  styleUrl: './purchase-list.component.scss',
  animations: [purchaseFieldAnim, gameCardAnim]
})
export class PurchaseListComponent extends Unsubscriber implements OnInit, AfterViewInit, OnDestroy {
  purchases: PurchaseItem[] = [];
  currentPage = 1;
  pageSize = 6;
  showFilters = false;
  isLoading = true;
  hoveredCard: any = null;

  constructor(
    private ratingService: RatingService, 
    private purchaseService: PurchaseService,
    private filterService: FiltrationService
  ) { super(); }

  ngOnInit() {
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
    setTimeout(() => this.initTilt(), 100);
    return this.filteredPurchases.slice(start, start + this.pageSize);
  }
  get totalPages(): number { return Math.ceil(this.filteredPurchases.length / this.pageSize); }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
    setTimeout(() => this.initTilt(), 100);
  }

  trackById(index: number, purchased_item: PurchaseItem) { return purchased_item.id }
  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
    setTimeout(() => this.initTilt(), 100);
  }
  prevPage() { 
    if (this.currentPage > 1) this.currentPage--;
    setTimeout(() => this.initTilt(), 0);
  }

  ngAfterViewInit() { this.initTilt(); }

  initTilt() {
    const purchasedCards = document.querySelectorAll(".purchasedGameCard");
    VanillaTilt.init(purchasedCards, { max: 10, speed: 500, glare: true, "max-glare": 0.5 });
  }
  
  ngOnDestroy() { this.subClean(); }
}