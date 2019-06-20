// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { HeaderComponent } from '../header/Header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BaseComponent } from './base.component';
import { BaseRoutingModule } from './base-routing.module';

@NgModule({
    declarations: [
        BaseComponent,
        HeaderComponent,
        SidebarComponent,
    ],
    exports: [
        HeaderComponent,
        SidebarComponent
    ],
    providers: [
    ],
    imports: [
        CommonModule,
        RouterModule,
        BaseRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        // BrowserAnimationsModule,
    ]
})
export class BaseModule {
}
