import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private userService: UserService, private router: Router) { }

  canActivate(): boolean {
    if (this.userService.isAuthenticated()) {
      return true;
    }

    // Если пользователь НЕ вошел - отправка на страницу авторизации
    this.router.navigate(['/auth']);
    return false;
  }
}
