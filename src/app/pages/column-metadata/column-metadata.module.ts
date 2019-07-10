import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { NgxLoadingModule } from 'ngx-loading';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { AccordionModule } from 'primeng/accordion';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ColumnMetadataRouting } from './column-metadata.routing';
import { ColumnMetadataComponent } from './column-metadata.component';
import { MetadataMappingComponent } from './metadata-mapping/metadata-mapping.component';
import { AddEditColumnComponent } from './add-edit-column/add-edit-column.component';
import { AllVersionsComponent } from './all-versions/all-versions.component';

@NgModule({
  declarations: [ColumnMetadataComponent, MetadataMappingComponent, AddEditColumnComponent, AllVersionsComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ColumnMetadataRouting,
    TableModule,
    NgxLoadingModule.forRoot({}),
    DynamicDialogModule,
    ScrollPanelModule,
    AccordionModule,
    DropdownModule,
    TabViewModule,
    MultiSelectModule,
    ToastModule
  ],
  providers: [MessageService],
  entryComponents: [MetadataMappingComponent]
})
export class ColumnMetadataModule { }
