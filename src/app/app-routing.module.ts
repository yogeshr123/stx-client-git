// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
    { path: 'login', loadChildren: './pages/login/login.module#LoginModule' },
    {
        path: '',
        loadChildren: './structure/base/base.module#BaseModule'
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
