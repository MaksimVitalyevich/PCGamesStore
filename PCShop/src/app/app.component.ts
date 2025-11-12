import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartService } from './services/cart.service';
import { RouterOutlet } from '@angular/router';
import { UserInfoComponent } from './components/user-info/user-info.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet, UserInfoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Онлайн магазин ПК игр';
  cartCount = 0;
  user: any = null;

  constructor(private cartService: CartService) { localStorage.clear(); }

  ngOnInit() { this.cartService.data$.subscribe(c => this.cartCount = c.length); }
}
