import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadControlService } from 'src/app/services/load-control.service';
import { MessageService } from 'primeng/api';
declare var $: any;
import { Table } from 'primeng/components/table/table';
import { EMRTableLoadingStatus } from './tableColumns';
import * as moment from 'moment';
import * as momentTZ from 'moment-timezone';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    globalQuery: string;
    recordsArray: any;
    selectedColumns: any;
    recordMeta: any;
    totalCols: any;
    currentDate = new Date();
    dataLoader = false;
    @ViewChild(Table, { static: false }) tableComponent: Table;
    ENV_NAME = [
        { label: 'PRD', value: 'PRD' },
        { label: 'DEV', value: 'DEV' },
        { label: 'QA', value: 'QA' },
    ];

    constructor(
        private loadControlService: LoadControlService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadAllRecords();
        this.getColumnDataType();
        if (!localStorage.getItem('dashboardSelectedColumns')) {
            this.initColumnState();
        } else {
            // get selected columns from local storage
            this.selectedColumns = JSON.parse(
                localStorage.getItem('dashboardSelectedColumns')
            );
        }
        const localTableState = JSON.parse(localStorage.getItem('GlobalQuery'));
        if (localTableState && localTableState.dashboard) {
            this.globalQuery = localTableState.dashboard;
            setTimeout(() => {
                this.getSearchQueryResult();
            }, 100);
        }
    }

    saveColumnState() {
        localStorage.setItem(
            'dashboardSelectedColumns',
            JSON.stringify(this.selectedColumns)
        );
        this.resetFilters();
        if (this.globalQuery) {
            const localTableState = JSON.parse(
                localStorage.getItem('GlobalQuery')
            );
            if (localTableState && localTableState.dashboard) {
                delete localTableState.dashboard;
                localStorage.setItem(
                    'GlobalQuery',
                    JSON.stringify(localTableState)
                );
                this.globalQuery = '';
                this.loadAllRecords();
            }
        }
    }

    resetFilters() {
        const statefilter = JSON.parse(
            localStorage.getItem('dashboardSelectedColumnsOrder')
        );
        if (statefilter) {
            localStorage.removeItem('dashboardSelectedColumnsOrder');
        }
        this.tableComponent.reset();
    }

    initColumnState() {
        this.selectedColumns = EMRTableLoadingStatus;
    }

    resetTable() {
        localStorage.removeItem('dashboardSelectedColumns');
        localStorage.removeItem('dashboardSelectedColumnsOrder');
        this.initColumnState();
        const localTableState = JSON.parse(localStorage.getItem('GlobalQuery'));
        if (localTableState && localTableState.dashboard) {
            delete localTableState.dashboard;
            localStorage.setItem(
                'GlobalQuery',
                JSON.stringify(localTableState)
            );
            this.globalQuery = '';
            this.loadAllRecords();
        }
    }

    getColumnDataType() {
        this.dataLoader = true;
        this.loadControlService.getColumnDataType().subscribe(
            (data: any) => {
                if (data.data && data.data.length > 0) {
                    this.recordMeta = data.data;
                    this.setTotalCols();
                }
                this.dataLoader = false;
            },
            error => {
                this.dataLoader = false;
                this.showToast('error', 'Error while fetching data.');
            }
        );
    }

    loadAllRecords() {
        this.dataLoader = true;
        this.loadControlService.getRecords().subscribe(
            (data: any) => {
                if (data.data && data.data.length > 0) {
                    this.recordsArray = data.data;
                    this.setTotalCols();
                }
                this.dataLoader = false;
            },
            error => {
                this.dataLoader = false;
                this.showToast('error', 'Error while fetching data.');
            }
        );
    }

    parseDateToGMT(date) {
        return new Date(date).toUTCString();
    }

    parseDateToCEST(date) {
        return moment(momentTZ(date).tz('Europe/Berlin')).format('LLLL');
    }

    getSearchQueryResult() {
        if (this.globalQuery) {
            this.dataLoader = true;
            this.loadControlService
                .getSearchQueryResult({ query: this.globalQuery })
                .subscribe(
                    (data: any) => {
                        if (data && data.data) {
                            this.recordsArray = data.data;
                            this.dataLoader = false;
                        }
                    },
                    error => {
                        this.dataLoader = false;
                        this.showToast('error', 'Error while fetching data.');
                    }
                );
        } else {
            this.loadAllRecords();
        }
    }

    setTotalCols() {
        this.dataLoader = true;
        this.totalCols = [];
        if (this.recordsArray && this.recordsArray.length) {
            for (const key in this.recordsArray[0]) {
                if (this.checkIfURL(key) === true) {
                    this.totalCols.push({
                        field: key,
                        header: key,
                        type: 'link',
                    });
                } else if (this.checkIfDate(key) === true) {
                    this.totalCols.push({
                        field: key,
                        header: key,
                        type: 'date',
                    });
                } else {
                    this.totalCols.push({ field: key, header: key });
                }
            }
        }
        this.dataLoader = false;
    }

    globalQueryEmpty() {
        const localTableState = JSON.parse(localStorage.getItem('GlobalQuery'));
        if (!localTableState) {
            localStorage.setItem(
                'GlobalQuery',
                JSON.stringify({ dashboard: this.globalQuery })
            );
        } else {
            localStorage.setItem(
                'GlobalQuery',
                JSON.stringify({
                    ...localTableState,
                    dashboard: this.globalQuery,
                })
            );
        }
    }

    checkIfURL(key) {
        let returnVal;
        switch (key) {
            case 'ETL_DAG_RUN_URL': {
                returnVal = true;
                break;
            }
            case 'T1_SPARK_UI_URL': {
                returnVal = true;
                break;
            }
            case 'T1_SPARK_LOG_URL': {
                returnVal = true;
                break;
            }
            case 'T2_SPARK_UI_URL': {
                returnVal = true;
                break;
            }
            case 'T2_SPARK_LOG_URL': {
                returnVal = true;
                break;
            }
            default: {
                returnVal = false;
                break;
            }
        }
        return returnVal;
    }

    checkIfDate(key) {
        if (this.recordMeta) {
            const index = Object.keys(this.recordMeta).find(
                k => this.recordMeta[k].COLUMN_NAME === key
            );
            if (index) {
                const dataType = this.recordMeta[index].DATA_TYPE;
                if (dataType == 'timestamp') {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }

    showToast(severity, summary) {
        this.messageService.add({ severity, summary, life: 3000 });
    }
}
