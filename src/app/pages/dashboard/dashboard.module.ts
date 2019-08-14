// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// NgBootstrap
import { DashboardComponent } from './dashboard.component';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';
import { DataLatencySummaryComponent } from './data-latency-summary/data-latency-summary.component';
import { LoadingStatusSummaryComponent } from './loading-status-summary/loading-status-summary.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        MultiSelectModule,
        RouterModule.forChild([
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'data-latency-summary',
                component: DataLatencySummaryComponent
            },
            {
                path: 'loading-status-summary',
                component: LoadingStatusSummaryComponent
            }
        ]),
    ],
    providers: [MessageService],
    declarations: [
        DashboardComponent,
        DataLatencySummaryComponent,
        LoadingStatusSummaryComponent,
    ]
})
export class DashboardModule {
}
