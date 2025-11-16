import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from '../../unsubscriber-helper';
import { UserRole } from '../../models/enumerators.model';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { modalAnims } from '../../app.animations';

@Component({
  selector: 'app-about-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-info.component.html',
  styleUrl: './about-info.component.scss',
  animations: [modalAnims]
})
export class AboutInfoComponent extends Unsubscriber implements OnInit, OnDestroy {
  @Input() user: any = null;
  role: UserRole | null = null;
  UserRole = UserRole;
  UserName: string | undefined = '';
  changeLogVersion: string = '1.4.3';
  isChangelogMode = false;
  elemHover = false;

  constructor(private userService: UserService, private router: Router) { 
    super(); 
    this.UserName = this.userService.user?.username 
  }

  ngOnInit() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe(u => this.user = u);
    this.userService.role$.pipe(takeUntil(this.destroy$)).subscribe(role => this.role = role);
  }

  checkUser() { return this.userService.isAuthenticated(); }

  onMainReturn() { this.router.navigate(['/']); }
  onProfileSend() { this.router.navigate(['/profile']); }

  openChangelog() { this.isChangelogMode = true; }
  closeChangelog() { this.isChangelogMode = false; }

  ngOnDestroy() { this.subClean(); }
}