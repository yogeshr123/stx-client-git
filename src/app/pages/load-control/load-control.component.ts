import { Component, OnInit } from '@angular/core';
import { LoadControlService } from '../../services/load-control.service';
import { NavigationExtras, Router } from '@angular/router';
import { RecordService } from '../../services/record.service';

export interface Car {
  TABLE_NAME?;
  ENV_NAME?;
  TARGET_SCHEMA_NAME?;
  color?;
  price?;
  saleDate?;
}

@Component({
  selector: 'app-loadcontrol',
  templateUrl: './load-control.component.html',
  styles: [':host{width: 100%; height: 100%;}']
})
export class LoadControlComponent implements OnInit {

  recordsArray: any[];
  ENV_NAME: any[];
  cols: any[];

  selectedRecords: any[];
  selectedColumns: any[];

  constructor(
    private loadControlService: LoadControlService,
    private recordService: RecordService,
    private router: Router
  ) {
  }

  ngOnInit() {
    // this.cols = [];
    this.loadControlService.getRecords().then(response => {
      console.log(response);
      if (response.data && response.data.length > 0) {
        this.recordsArray = response.data;
        // for (var key in this.recordsArray[0]) {
        //   this.cols.push({ field: key, header: key });
        // }
      }
    });

    this.ENV_NAME = [
      { label: 'PRD', value: 'PRD' },
      { label: 'DEV', value: 'DEV' },
      { label: 'QA', value: 'QA' }
    ];

    this.cols = [
      { field: 'SCHEMA_NAME' },
      { field: 'TABLE_NAME' },
      { field: 'ENV_NAME' },
      { field: 'TARGET_SCHEMA_NAME' },
      { field: 'TARGET_TABLE_NAME' },
      { field: 'EMAIL_ALERTS' },
      // { field: 'TABLE_SOURCE' },
      // { field: 'LOAD_STRATEGY' },
    ];

    this.selectedColumns = this.cols;
  }

  onRowEdit(row: any) {
    console.log(row);
    this.recordService.changeActiveRecord(row);
    this.router.navigate(['/loadcontrol/edit']);
  }
}





