// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
const routes: Routes = [
    { path: 'login', component: LoginComponent },
    // { path: 'dashboard', component: DashboardComponent },
    // { path: 'loadcontrol', component: LoadControlComponent },
    // { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '', loadChildren: './structure/base/base.module#BaseModule' },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
