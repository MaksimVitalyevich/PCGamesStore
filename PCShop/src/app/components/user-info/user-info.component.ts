import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Unsubscriber } from '../../unsubscriber-helper';
import { takeUntil } from 'rxjs/operators';
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
export class UserInfoComponent extends Unsubscriber implements OnInit, OnDestroy {
  currentUserId = 0;
  currentRole: UserRole | null = null;
  balance = 0;
  hover = false;

  constructor(private userService: UserService, private balanceService: BalanceService) { super(); }

  ngOnInit() {
    this.userService.role$.pipe(takeUntil(this.destroy$)).subscribe(role => this.currentRole = role );
    this.balanceService.balance$.pipe(takeUntil(this.destroy$)).subscribe(balance => this.balance = balance);
  }

  ngOnDestroy(): void { this.subClean(); }
}
