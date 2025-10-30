import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  priceRange = [0, 5000];
  ratingRange = [0, 10];
  selectedGenre: string = '';
  isClosed = false;

  genres = ['Action', 'RPG', 'Shooter', 'Adventure', 'Simulation']

  @Output() filtersChanged = new EventEmitter<any>();

  applyFilters() {
    this.filtersChanged.emit({
      price: this.priceRange,
      rating: this.ratingRange,
      genres: this.selectedGenre
    });
    this.isClosed = true;
  }

  onClose() { this.isClosed = true; }
}
