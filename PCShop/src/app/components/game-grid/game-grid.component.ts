import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Game } from '../../models/game.model';
import { UserRole } from '../../models/enumerators.model';
import { FiltrationService } from '../../services/filtration.service';
import { GameFiltersComponent } from '../game-filters/game-filters.component';
import { modalAnims, gameCardAnim, gameEditAnim } from '../../app.animations';
declare var VanillaTilt: any;

@Component({
  selector: 'app-game-grid',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GameFiltersComponent],
  templateUrl: './game-grid.component.html',
  styleUrl: './game-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [modalAnims, gameCardAnim, gameEditAnim]
})
export class GameGridComponent extends Unsubscriber implements OnInit, AfterViewInit, OnDestroy {
  @Input() games: Game[] = [];
  @Input() role: UserRole | null = null;
  @Input() getStars!: (title: string) => any;
  @Input() isPurchasedAlready!: (id: number) => boolean;

  @Output() buyGame = new EventEmitter<Game>();
  @Output() deleteGame = new EventEmitter<number>();
  @Output() editGame = new EventEmitter<Game>();
  @Output() addNew = new EventEmitter<Game>();

  hoveredCard: any = null;
  selectedGame: Game | null = null;
  UserRole = UserRole;
  currentPage = 1;
  pageSize = 6;
  showModal = false;
  showFilters = false;
  isEditing = false;
  gameForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private filterService: FiltrationService
  ) { super(); }

  ngOnInit() {
    this.filterService.filterToogle$.pipe(takeUntil(this.destroy$)).subscribe(() => this.currentPage = 1);
  }

  ngAfterViewInit() { this.initTilt(); }

  get filteredGames(): Game[] {
    try {
      return (this.games || []).filter(game => this.filterService.applyFilters(game));
    } catch {
      return this.games || [];
    }
  }

  get pagedGames(): Game[] {
    const start = (this.currentPage - 1) * this.pageSize;
    setTimeout(() => this.initTilt(), 100);
    return (this.filteredGames || []).slice(start, start + this.pageSize);
  }

  get totalPages(): number { return Math.ceil(this.filteredGames.length / this.pageSize); }

  /** Переход на страницу (пагинация) */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
    setTimeout(() => this.initTilt(), 100);
  }

  trackById(index: number, item: Game) { return item.id; }
  nextPage() { 
    if (this.currentPage < this.totalPages) this.currentPage++;
    setTimeout(() => this.initTilt(), 100);
  }
  prevPage() { 
    if (this.currentPage > 1) this.currentPage--;
    setTimeout(() => this.initTilt(), 100);
  }

  openModal(game: Game) {
    this.selectedGame = game;
    this.isEditing = false;
    this.showModal = true;
  }

  toggleFilters() { this.showFilters = !this.showFilters; }
  closeFiltersModal() { this.showFilters = false; }
  resetAllFilters() { this.filterService.resetFilters(); }

  imageEdit(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const imageFile = input.files[0];
    const validTypes = ['image/webp', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(imageFile.type)) {
      alert('Недопустимый формат для изображения для обложки игры!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      this.gameForm.patchValue({ image: imageData });
    };
    reader.readAsDataURL(imageFile);
  }

  startEdit(game?: Game) {
    this.isEditing = true;
    this.selectedGame = game || null;
    this.showModal = true;

    this.gameForm = this.fb.group({
      title: [game?.title || '', Validators.required],
      published_at: [game?.published_at || null],
      genre: [game?.genre || '', Validators.required],
      rating: [game?.rating || 0, [Validators.required, Validators.min(0), Validators.max(10)]],
      price: [game?.price || 0, [Validators.required, Validators.min(0)]],
      systemRequirements: [game?.systemRequirements || ''],
      image: [game?.image || 'games/no-cover.png'],
      developer: [game?.developer || ''],
      companyName: [game?.companyName || ''],
      localization: [game?.localization || '']
    });
  }

  /** Сохранение изменении при добавлении/редактировании игры */
  onSave() {
    if (this.gameForm.invalid) return;

    const data = { ...this.selectedGame, ...this.gameForm.value };
    if (this.selectedGame) {
      this.editGame.emit(data);
    }
    else {
      data.id = this.games.length ? Math.max(...this.games.map(g => g.id)) + 1 : 1;
      this.addNew.emit(data);
    }

    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.selectedGame = null;
  }

  initTilt() {
    const cards = document.querySelectorAll('.gameCard');
    VanillaTilt.init(cards, { max: 10, speed: 400, glare: true, 'max-glare': 0.4 });
  }

  ngOnDestroy() { this.subClean(); }
}