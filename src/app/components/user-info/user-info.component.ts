import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { BalanceService } from '../../services/balance.service';
import { UserRole } from '../../models/enumerators.model';
import { userInfoAnims } from '../../app.animations';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
  animations: [userInfoAnims]
})
export class UserInfoComponent {
  currentRole: UserRole | null = null;
  balance = 0;
  hover = false;

  constructor(private userService: UserService, private balanceServie: BalanceService) { }

  ngOnInit() {
    this.userService.role$.subscribe(role => this.currentRole = role);
    this.balanceServie.balance$.subscribe(balance => this.balance = balance);
  }
}
