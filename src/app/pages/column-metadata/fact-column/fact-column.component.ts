import { Component, OnInit } from '@angular/core';
import { ColumnMetadataService } from 'src/app/services/column-metadata.service';
import {
    DynamicDialogConfig,
    MessageService,
    DynamicDialogRef,
} from 'primeng/api';
import { LoadControlService } from 'src/app/services/load-control.service';

@Component({
    selector: 'app-fact-column',
    templateUrl: './fact-column.component.html',
    styleUrls: ['./fact-column.component.scss'],
})
export class FactColumnComponent implements OnInit {
    tables: any;
    selectedTable: any = '';
    errors = '';
    columns: any;
    alreadyAddedColumns: any;
    columnsSavedInPrev = [];
    existingTable: any;
    saveLoader = false;
    dataLoader = false;
    removedColumns: any;

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private messageService: MessageService,
        private columnMetadataService: ColumnMetadataService,
        private loadControlService: LoadControlService
    ) {}

    ngOnInit() {
        this.existingTable = this.config.data;
        this.getColumns(
            this.existingTable.TABLE_NAME,
            this.existingTable.METADATA_VERSION,
            true
        );
        this.getFactTableInfo();
    }

    getFactTableInfo() {
        this.dataLoader = true;
        const request = {
            query: `SCHEMA_NAME = '${this.existingTable.SCHEMA_NAME}' AND TABLE_NAME = '${this.existingTable.TABLE_NAME}'`,
        };
        this.loadControlService
            .getSearchQueryResult(request)
            .subscribe((resp: any) => {
                if (resp.data && resp.data.length) {
                    this.tables = resp.data[0];
                    this.getTableVersions(this.tables.FACT_TABLE_NAME);
                }
                this.dataLoader = false;
            });
    }

    removeDuplicates(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }

    tableSelected() {
        this.errors = '';
        this.columns = [];
        this.dataLoader = true;
        this.getTableVersions(this.selectedTable.TABLE_NAME);
    }

    getTableVersions(tableName) {
        const request = {
            table_name: tableName,
        };
        this.columnMetadataService
            .getTableVersions(request)
            .subscribe((resp: any) => {
                if (!resp.error && resp.data && resp.data.length) {
                    let metadataVersions = resp.data.map(i => {
                        if (i.STATUS === 'VALIDATED') {
                            return i.METADATA_VERSION;
                        }
                    });
                    if (metadataVersions && metadataVersions.length) {
                        metadataVersions = metadataVersions.filter(
                            i => i !== undefined
                        );
                        const maximumVersion = Math.max.apply(
                            null,
                            metadataVersions
                        );
                        this.getColumns(tableName, maximumVersion);
                    } else {
                        this.dataLoader = false;
                        this.errors =
                            'There are no columns available for this table.';
                    }
                } else {
                    this.dataLoader = false;
                    this.errors =
                        'There are no columns available for this table.';
                }
            });
    }

    compareData() {
        if (
            this.columns &&
            this.columns.length &&
            this.alreadyAddedColumns &&
            this.alreadyAddedColumns.length
        ) {
            this.columns.forEach(e1 => {
                this.alreadyAddedColumns.forEach(e2 => {
                    if (e1.TARGET_COLUMN_NAME === e2.TARGET_COLUMN_NAME) {
                        e1.checked = true;
                        e1.isOld = true;
                        this.columnsSavedInPrev.push(e1.TARGET_COLUMN_NAME);
                    }
                });
            });
            this.dataLoader = false;
        } else {
            if (this.alreadyAddedColumns && !this.alreadyAddedColumns.length) {
                this.dataLoader = false;
            }
        }
    }

    getColumns(tableName, metadataVersion, toCompare?) {
        const request = {
            table_name: tableName,
            columnVersion: metadataVersion,
        };
        this.columnMetadataService.getAllColumns(request).subscribe(
            (resp: any) => {
                if (!resp.error && resp.data && resp.data.length) {
                    if (!toCompare) {
                        this.columns = resp.data;
                        this.compareData();
                    } else {
                        this.alreadyAddedColumns = resp.data;
                    }
                } else {
                    this.dataLoader = false;
                    this.errors =
                        'There are no columns available for this table.';
                }
            },
            error => {
                this.showToast('error', 'Could not get columns added');
            }
        );
    }

    itemChecked(item) {
        item.checked = !item.checked;

        const uncheckedItems = this.columns.filter(i => i.checked === false);
        const itemsToRemove = [];
        uncheckedItems.forEach(element => {
            if (
                this.columnsSavedInPrev.indexOf(element.TARGET_COLUMN_NAME) > -1
            ) {
                itemsToRemove.push(element);
            }
        });
        this.removedColumns = itemsToRemove;
    }

    saveColumns() {
        this.saveLoader = true;
        const appState = JSON.parse(localStorage.getItem('appState'));
        let selectedColumns = this.columns.filter(i => i.checked && !i.isOld);
        selectedColumns = selectedColumns.map(i => {
            i.SCHEMA_NAME = this.existingTable.SCHEMA_NAME;
            i.TABLE_NAME = this.existingTable.TABLE_NAME;
            i.METADATA_VERSION = this.existingTable.METADATA_VERSION;
            i.SRC_COLUMN_TYPE = 'MAPPED';
            i.SRC_COLUMN_NAME = i.TARGET_COLUMN_NAME;
            i.SRC_DATA_TYPE = i.TARGET_DATA_TYPE;
            if (i.SRC_DATA_TYPE === 'int') {
                i.SRC_DATA_TYPE = 'integer';
            }
            if (i.SRC_DATA_TYPE.indexOf('varchar') > -1) {
                i.SRC_DATA_TYPE = 'string';
            }
            if (i.SRC_DATA_TYPE === 'bigint') {
                i.SRC_DATA_TYPE = 'long';
            }
            i.UPDATE_DATE = `${new Date()}`;
            i.INTERNAL_COLUMN = i.INTERNAL_COLUMN.data
                ? i.INTERNAL_COLUMN.data[0]
                : i.INTERNAL_COLUMN;
            i.IS_DATATYPE_CHANGED = i.IS_DATATYPE_CHANGED.data
                ? i.IS_DATATYPE_CHANGED.data[0]
                : i.IS_DATATYPE_CHANGED;
            i.IS_PARTITION_COLUMN = i.IS_PARTITION_COLUMN.data
                ? i.IS_PARTITION_COLUMN.data[0]
                : i.IS_PARTITION_COLUMN;
            i.IS_PKEY_COLUMN = i.IS_PKEY_COLUMN.data
                ? i.IS_PKEY_COLUMN.data[0]
                : i.IS_PKEY_COLUMN;
            i.IS_RENAMED = i.IS_RENAMED.data
                ? i.IS_RENAMED.data[0]
                : i.IS_RENAMED;
            i.IS_UPDATE_DATE_COLUMN = i.IS_UPDATE_DATE_COLUMN.data
                ? i.IS_UPDATE_DATE_COLUMN.data[0]
                : i.IS_UPDATE_DATE_COLUMN;
            i.IS_NEW = 1;
            if (appState.loggedInUser && appState.loggedInUser.USER_NAME) {
                i.UPDATED_BY = appState.loggedInUser.USER_NAME;
            }
            delete i.checked;
            return i;
        });
        this.removedColumns = this.removedColumns.map(i => {
            i.SCHEMA_NAME = this.existingTable.SCHEMA_NAME;
            i.TABLE_NAME = this.existingTable.TABLE_NAME;
            i.METADATA_VERSION = this.existingTable.METADATA_VERSION;
            return i;
        });
        console.log('selectedColumns ', selectedColumns);
        const request = {
            columnsToAdd: selectedColumns,
            columnsToRemove: this.removedColumns,
        };
        this.columnMetadataService.saveFactColumns(request).subscribe(
            (resp: any) => {
                if (!resp.error) {
                    this.showToast('success', 'Successfully saved columns.');
                    localStorage.removeItem('localCopyOfVersion');
                    this.closePopUp(true);
                } else {
                    this.showToast('error', 'Could not save columns');
                }
                this.saveLoader = false;
            },
            error => {
                this.saveLoader = false;
                this.showToast('error', 'Could not save columns');
            }
        );
    }

    closePopUp(status) {
        this.ref.close(status);
    }

    showToast(severity, summary) {
        this.messageService.add({ severity, summary, life: 3000 });
    }
}
