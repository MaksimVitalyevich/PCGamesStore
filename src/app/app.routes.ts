import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PaymentComponent } from './components/payment/payment.component';
import { CartComponent } from './components/cart/cart.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthFormComponent } from './components/auth-form/auth-form.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuardService] },
    { path: 'payment', component: PaymentComponent, canActivate: [AuthGuardService] },
    { path: 'cart', component: CartComponent, canActivate: [AuthGuardService] },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
    { path: 'auth', component: AuthFormComponent }
];
