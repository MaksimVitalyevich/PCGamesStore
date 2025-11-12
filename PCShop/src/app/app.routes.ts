import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PaymentComponent } from './components/payment/payment.component';
import { CartComponent } from './components/cart/cart.component';
import { PurchaseListComponent } from './components/purchase-list/purchase-list.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AboutInfoComponent } from './components/about-info/about-info.component';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthFormComponent } from './components/auth-form/auth-form.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'payment', component: PaymentComponent, canActivate: [AuthGuardService] },
    { path: 'cart', component: CartComponent, canActivate: [AuthGuardService] },
    { path: 'purchases', component: PurchaseListComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] },
    { path: 'about', component: AboutInfoComponent },
    { path: 'auth', component: AuthFormComponent }
];
