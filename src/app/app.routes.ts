import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { IntroComponent } from './intro/intro.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'intro', pathMatch: 'full' },
  { path: 'intro', component: IntroComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] }
];
