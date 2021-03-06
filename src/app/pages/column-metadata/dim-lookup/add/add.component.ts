import { Component, OnInit } from '@angular/core';
import {
    DynamicDialogConfig,
    MessageService,
    DynamicDialogRef,
} from 'primeng/api';
import { ColumnMetadataService } from 'src/app/services/column-metadata.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit {
    addForm: FormGroup;
    selectedTable: any;
    dimensionTables: any;
    dimensionTableColumns: any;
    tableColumns: any;
    dimensionColumns: any;
    action: any;
    lookUp: any;
    aliases: any;
    colNamePrefix: any;
    errors = {
        noValidatedVersion: '',
    };
    saveLookUpLoader = false;
    LOOKUP_COLUMNS = [];
    LOOKUP_COLUMNS_BACKUP = [];
    oldVersionColumns = [];
    oldVersionColumnsBackUp = [];
    displayExistingColumns = false;

    constructor(
        public ref: DynamicDialogRef,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private columnMetadataService: ColumnMetadataService,
        public config: DynamicDialogConfig
    ) {}

    ngOnInit() {
        this.selectedTable = this.config.data.selectedTable;
        this.dimensionTables = this.config.data.dimensionTables;
        this.action = this.config.data.action;
        this.lookUp = this.config.data.lookUp;
        this.aliases = this.config.data.aliases;
        this.colNamePrefix = this.config.data.colNamePrefix;
        this.dimensionTables = this.dimensionTables.map(i => {
            i.schemaTableName = `${i.SCHEMA_NAME}-${i.TABLE_NAME}`;
            return i;
        });
        this.tableColumns = this.config.data.allColumns;
        this.formInit();
        if (this.action === 'view' || this.action === 'edit') {
            this.setValuesInViewEdit();
            // this.getEditDIMColumns();
        }
        this.getUserInfo();
    }

    formInit() {
        this.addForm = this.formBuilder.group({
            SCHEMA_NAME: [this.selectedTable.SCHEMA_NAME, Validators.required],
            TABLE_NAME: [this.selectedTable.TABLE_NAME, Validators.required],
            METADATA_VERSION: [
                this.selectedTable.METADATA_VERSION,
                Validators.required,
            ],
            LOOKUP_TABLE_NAME: ['', Validators.required],
            LOOKUP_TABLE_ALIAS: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.pattern(/^[a-zA-Z][a-zA-Z0-9]+$/),
                ]),
            ],
            LOOKUP_JOIN_KEYS1: ['', Validators.required],
            LOOKUP_JOIN_KEYS2: ['', Validators.required],
            LOOKUP_COLUMNS: [[], Validators.required],
            COLUMN_NAME_PREFIX: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.pattern(/^[a-zA-Z][a-zA-Z0-9]+$/),
                ]),
            ],
            UPDATED_BY: ['User'],
            UPDATE_DATE: [new Date()],
        });
    }

    getUserInfo() {
        const appState = JSON.parse(localStorage.getItem('appState'));
        if (appState.loggedInUser && appState.loggedInUser.USER_NAME) {
            this.addForm.controls.UPDATED_BY.patchValue(
                appState.loggedInUser.USER_NAME
            );
        }
    }

    destinationChange() {
        this.addForm.controls.LOOKUP_COLUMNS.patchValue(this.LOOKUP_COLUMNS);
    }

    setValuesInViewEdit() {
        this.addForm.controls.SCHEMA_NAME.patchValue(this.lookUp.SCHEMA_NAME);
        this.addForm.controls.TABLE_NAME.patchValue(this.lookUp.TABLE_NAME);
        this.addForm.controls.METADATA_VERSION.patchValue(
            this.lookUp.METADATA_VERSION
        );
        this.addForm.controls.LOOKUP_TABLE_ALIAS.patchValue(
            this.lookUp.LOOKUP_TABLE_ALIAS
        );
        this.addForm.controls.COLUMN_NAME_PREFIX.patchValue(
            this.lookUp.COLUMN_NAME_PREFIX
        );
        const getLookUpTable = this.dimensionTables.filter(
            i => i.TABLE_NAME === this.lookUp.LOOKUP_TABLE_NAME
        );
        if (getLookUpTable && getLookUpTable.length) {
            this.addForm.controls.LOOKUP_TABLE_NAME.patchValue(
                getLookUpTable[0]
            );
            this.tableSelected(getLookUpTable[0].TABLE_NAME);
        }
        const joinKeys = this.lookUp.LOOKUP_JOIN_KEYS.split('=');
        const lookJoinKey1 = joinKeys[0].split('.')[1];
        if (lookJoinKey1) {
            const selectedJoinKey = this.tableColumns.filter(
                i => i.TARGET_COLUMN_NAME === lookJoinKey1
            );
            if (selectedJoinKey && selectedJoinKey.length) {
                this.addForm.controls.LOOKUP_JOIN_KEYS1.patchValue(
                    selectedJoinKey[0]
                );
            }
        }
    }

    setDimensionJoinKey() {
        const joinKeys = this.lookUp.LOOKUP_JOIN_KEYS.split('=');
        const lookJoinKey2 = joinKeys[1].split('.')[1];
        if (lookJoinKey2) {
            const selectedJoinKey = this.dimensionTableColumns.filter(
                i => i.TARGET_COLUMN_NAME === lookJoinKey2
            );
            if (selectedJoinKey && selectedJoinKey.length) {
                this.addForm.controls.LOOKUP_JOIN_KEYS2.patchValue(
                    selectedJoinKey[0]
                );
            }
        }
    }

    getColumns() {
        const request = {
            table_name: this.lookUp.TABLE_NAME,
            columnVersion: this.lookUp.METADATA_VERSION,
        };
        this.columnMetadataService.getAllColumns(request).subscribe(
            (resp: any) => {
                if (!resp.error && resp.data && resp.data.length) {
                    const selectedColumns = resp.data.filter(
                        i =>
                            i.LOOKUP_TABLE_ALIAS ===
                            this.lookUp.LOOKUP_TABLE_ALIAS
                    );
                    let dimColumnArray = [];
                    this.oldVersionColumns = [];
                    selectedColumns.forEach(e1 => {
                        if (
                            e1.IS_NEW &&
                            e1.IS_NEW.data &&
                            e1.IS_NEW.data[0] === 0
                        ) {
                            this.oldVersionColumns.push(e1.TARGET_COLUMN_NAME);
                        }
                        this.dimensionTableColumns.forEach(e2 => {
                            if (e1.SRC_COLUMN_NAME === e2.SRC_COLUMN_NAME) {
                                e2.IS_NEW =
                                    e1.IS_NEW && e1.IS_NEW.data
                                        ? e1.IS_NEW.data[0]
                                        : e1.IS_NEW;
                                dimColumnArray.push(e2);
                            }
                        });
                    });
                    this.addForm.controls.LOOKUP_COLUMNS.patchValue(
                        dimColumnArray
                    );
                    dimColumnArray = dimColumnArray.filter(i => i.IS_NEW === 1);
                    // remove from right side list previous version
                    this.LOOKUP_COLUMNS = dimColumnArray;
                    this.LOOKUP_COLUMNS_BACKUP = JSON.parse(
                        JSON.stringify(dimColumnArray)
                    );
                    // remove from left side list previous version
                    this.dimensionTableColumns = this.dimensionTableColumns.filter(
                        i => {
                            if (
                                this.oldVersionColumns.indexOf(
                                    i.TARGET_COLUMN_NAME
                                ) === -1
                            ) {
                                return i;
                            }
                        }
                    );
                    this.oldVersionColumnsBackUp = this.oldVersionColumns;
                }
            },
            error => {
                this.showToast('error', 'Could not get columns added');
            }
        );
    }

    tableSelected(tableName) {
        this.errors.noValidatedVersion = null;
        this.dimensionTableColumns = [];
        this.getTableVersions(tableName);
        this.addForm.controls.LOOKUP_JOIN_KEYS2.patchValue('');
        this.addForm.controls.LOOKUP_COLUMNS.patchValue([]);
        this.LOOKUP_COLUMNS = [];
    }

    getTableVersions(tableName) {
        const request = {
            table_name: tableName,
        };
        this.columnMetadataService
            .getTableVersions(request)
            .subscribe((resp: any) => {
                if (resp.data && resp.data.length) {
                    let validatedVersions = resp.data.map(i => {
                        if (i.STATUS === 'VALIDATED') {
                            return i.METADATA_VERSION;
                        }
                    });
                    validatedVersions = validatedVersions.filter(
                        i => i !== undefined
                    );
                    if (validatedVersions && validatedVersions.length) {
                        const max = Math.max.apply(null, validatedVersions);
                        this.getDimensionColumns(tableName, max);
                    } else {
                        this.errors.noValidatedVersion =
                            'No validated version found for this table.';
                    }
                }
            });
    }

    getDimensionColumns(tableName, version) {
        const request = {
            table_name: tableName,
            columnVersion: version,
        };
        this.columnMetadataService.getAllColumns(request).subscribe(
            (resp: any) => {
                this.dimensionTableColumns = resp.data;
                if (this.action === 'view' || this.action === 'edit') {
                    this.setDimensionJoinKey();
                    this.getColumns();
                }
            },
            error => {
                this.showToast(
                    'error',
                    'Could not get dimension tables columns.'
                );
            }
        );
    }

    checkValidations(control) {
        switch (control) {
            case 'alias':
                if (
                    this.aliases.indexOf(
                        this.addForm.value.LOOKUP_TABLE_ALIAS
                    ) > -1
                ) {
                    this.addForm.controls.LOOKUP_TABLE_ALIAS.setErrors({
                        incorrect: true,
                    });
                }
                break;
            case 'prefix':
                if (
                    this.colNamePrefix.indexOf(
                        this.addForm.value.COLUMN_NAME_PREFIX
                    ) > -1
                ) {
                    this.addForm.controls.COLUMN_NAME_PREFIX.setErrors({
                        incorrect: true,
                    });
                }
                break;

            default:
                break;
        }
    }

    submit() {
        // Save in lookUp Table
        this.saveLookUpLoader = true;
        const lookUpObject = Object.assign({}, this.addForm.value);
        lookUpObject.LOOKUP_SCHEMA_NAME =
            lookUpObject.LOOKUP_TABLE_NAME.SCHEMA_NAME;
        lookUpObject.LOOKUP_TABLE_NAME =
            lookUpObject.LOOKUP_TABLE_NAME.TABLE_NAME;
        lookUpObject.UPDATE_DATE = `${lookUpObject.UPDATE_DATE}`;
        lookUpObject.LOOKUP_JOIN_KEYS =
            // tslint:disable-next-line:max-line-length
            `fact.${lookUpObject.LOOKUP_JOIN_KEYS1.TARGET_COLUMN_NAME}=${lookUpObject.LOOKUP_TABLE_ALIAS}.${lookUpObject.LOOKUP_JOIN_KEYS2.TARGET_COLUMN_NAME}`;
        delete lookUpObject.LOOKUP_JOIN_KEYS1;
        delete lookUpObject.LOOKUP_JOIN_KEYS2;
        delete lookUpObject.LOOKUP_COLUMNS;

        let columnsToAdd = JSON.parse(JSON.stringify(this.addForm.value));
        columnsToAdd.LOOKUP_COLUMNS = JSON.parse(
            JSON.stringify(this.LOOKUP_COLUMNS)
        );
        columnsToAdd = columnsToAdd.LOOKUP_COLUMNS.map(i => {
            i.SCHEMA_NAME = this.selectedTable.SCHEMA_NAME;
            i.LOOKUP_TABLE_ALIAS = lookUpObject.LOOKUP_TABLE_ALIAS;
            i.IS_NEW = 1;
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
            i.SRC_COLUMN_TYPE = 'DIMLOOKUP';
            i.TABLE_NAME = this.selectedTable.TABLE_NAME;
            if (
                i.TARGET_COLUMN_NAME.indexOf(columnsToAdd.COLUMN_NAME_PREFIX) <
                0
            ) {
                i.TARGET_COLUMN_NAME = `${columnsToAdd.COLUMN_NAME_PREFIX}_${i.TARGET_COLUMN_NAME}`;
            } else {
                i.TARGET_COLUMN_NAME = i.TARGET_COLUMN_NAME;
            }
            i.METADATA_VERSION = this.selectedTable.METADATA_VERSION;
            i.UPDATE_DATE = `${new Date()}`;
            return i;
        });
        let columnsToRemove = [];
        if (this.LOOKUP_COLUMNS_BACKUP && this.LOOKUP_COLUMNS_BACKUP.length) {
            const allAddedColumns = this.LOOKUP_COLUMNS_BACKUP.map(
                i => i.SRC_COLUMN_NAME
            );
            columnsToAdd = columnsToAdd.filter(
                i => allAddedColumns.indexOf(i.SRC_COLUMN_NAME) === -1
            );
            const allRemovedColumns = this.LOOKUP_COLUMNS.map(
                i => i.SRC_COLUMN_NAME
            );
            columnsToRemove = this.LOOKUP_COLUMNS_BACKUP.filter(
                i => allRemovedColumns.indexOf(i.SRC_COLUMN_NAME) === -1
            );
            columnsToRemove = columnsToRemove.map(i => {
                i.TABLE_NAME = this.selectedTable.TABLE_NAME;
                i.SCHEMA_NAME = this.selectedTable.SCHEMA_NAME;
                i.LOOKUP_TABLE_ALIAS = lookUpObject.LOOKUP_TABLE_ALIAS;
                i.METADATA_VERSION = this.selectedTable.METADATA_VERSION;
                return i;
            });
        }
        this.columnMetadataService
            .addLookUp({
                data: lookUpObject,
                isEdit: this.action === 'edit',
                columnsToAdd,
                columnsToRemove,
            })
            .subscribe(
                (resp: any) => {
                    if (!resp.error) {
                        this.showToast('success', 'Successfully saved lookup!');
                        this.closePopUp(true);
                        localStorage.removeItem('localCopyOfVersion');
                    } else {
                        this.showToast('error', 'Could not save lookup info.');
                    }
                    this.saveLookUpLoader = false;
                },
                error => {
                    this.showToast('error', 'Could not save lookup info.');
                    this.saveLookUpLoader = false;
                }
            );
    }

    filterItem(value) {
        if (!value) {
            this.oldVersionColumns = this.oldVersionColumnsBackUp;
        }
        if (value) {
            this.oldVersionColumns = this.oldVersionColumnsBackUp.filter(
                item => {
                    return item.toLowerCase().indexOf(value.toLowerCase()) > -1;
                }
            );
        }
    }

    reset() {
        if (this.action === 'new') {
            this.LOOKUP_COLUMNS = [];
            this.formInit();
        }
    }

    showToast(severity, summary) {
        this.messageService.add({ severity, summary, life: 3000 });
    }

    closePopUp(status) {
        this.ref.close(status);
    }

    closeModal() {
        this.displayExistingColumns = !this.displayExistingColumns;
    }

    showExistingColumnsPopUp() {
        this.displayExistingColumns = !this.displayExistingColumns;
    }
}
