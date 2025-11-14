import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltrationService } from '../../services/filtration.service';
import { modalAnims, sidebarSlideIn } from '../../app.animations';

@Component({
  selector: 'app-game-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-filters.component.html',
  styleUrl: './game-filters.component.scss',
  animations: [modalAnims, sidebarSlideIn]
})
export class GameFiltersComponent {
  @Output() closed = new EventEmitter<void>();
  priceRange = [0, 3000]
  ratingRange = [0, 10];
  selectedGenre: string = '';
  purchaseDate: string = '';
  promoUsed: boolean | null = null;
  isClosed = false;

  genres = ['Action', 'FPS', 'RPG', 'Sci-Fi', 'Racing', 'Horror', 'Shooter', 'Fighting', 'Adventure', 'Puzzle', 'Open World', 'Sandbox', 'Simulatior'];

  constructor(private filterService: FiltrationService) { }

  applyFilters() {
    const filters = {
      price: this.priceRange,
      rating: this.ratingRange,
      genres: this.selectedGenre,
      purchase_date: this.purchaseDate,
      promo_used: this.promoUsed
    };
    this.filterService.updateFilters(filters);
    this.onClose();
  }

  onClose() { 
    this.isClosed = true;
    setTimeout(() => this.closed.emit(), 300);
  }
}
