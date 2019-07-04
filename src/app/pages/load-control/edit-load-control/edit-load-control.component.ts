import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecordService } from '../../../services/record.service';
import { Router } from '@angular/router';
import { LoadControl } from '../../../model/load-control';
import { LoadControlService } from '../../../services/load-control.service';
declare var $: any;

@Component({
  selector: 'app-edit-load-control',
  templateUrl: './edit-load-control.component.html',
  styleUrls: ['./edit-load-control.component.css']
})

export class EditLoadControlComponent implements OnInit {
  editLoadControlForm: FormGroup;
  submitted = false;
  record: any;
  loadControl: any;
  newRecord: boolean = true;
  temprecord = { "SCHEMA_NAME": "DRIVE", "TABLE_NAME": "P250_ERROR_RATE_BY_ZONE_FACT", "ENV_NAME": "PRD", "TARGET_SCHEMA_NAME": "DRIVE", "TARGET_TABLE_NAME": "P250_TEST", "EMAIL_ALERTS": "Y", "TABLE_SOURCE": "RAW_FACTORY", "LOAD_STRATEGY": "SAMPLED", "RAW_FACTORY_PATH": "s3://stx-usw2-ehc-prd-data-staging/p250_error_rate_by_zone/t0/", "RAW_FACTORY_RETENTION_STRATEGY": "GLACIER", "RAW_FACTORY_RETENTION_DAYS": 1830, "DB_ID": null, "DB_SCHEMA": null, "DB_TABLE": null, "DB_TABLE_PK_COLUMNS": null, "DB_TABLE_UPDATE_DATE_COLUMN": null, "T1_PATH": "s3://stx-usw2-ehc-prd-data-t1/drive.db_p250_error_rate_by_zone_fact/", "T1_RETENTION_STRATEGY": "DELETE", "T1_RETENTION_DAYS": 30, "T2_T3_RETENTION_STRATEGY": "NONE", "T2_T3_RETENTION_DAYS": null, "ETL_STATUS": "TODO", "ETL_DAG_NAME": null, "ETL_DAG_RUN_ID": null, "ETL_DAG_RUN_URL": null, "ETL_PROCESS_START_DATE": null, "ETL_PROCESS_END_DATE": null, "ETL_EXECUTION_STATUS": "NONE", "ETL_PROCESS": null, "T1_STATUS": "TODO", "T1_BATCH_IN_DAYS": 1, "T1_MAX_LOAD_END_DATE": "1990-01-01T00:00:00.000Z", "T1_CLUSTER_ID": null, "T1_LIVY_BATCH_ID": null, "T1_SPARK_APP_ID": null, "T1_SPARK_UI_URL": null, "T1_SPARK_LOG_URL": null, "T1_PROCESS_START_DATE": null, "T1_PROCESS_END_DATE": null, "T1_EXECUTION_STATUS": "TODO", "T1_ERROR": null, "T1_ERROR_TRACE": null, "T2_STATUS": "TODO", "T2_INSERT_DIR_BATCH_SIZE": 10000, "T2_PARTITION_JOB_TYPE": "SINGLE", "T2_MAX_LOAD_END_DATE": "1970-01-01T00:00:01.000Z", "T2_MAX_ATLAS_VERSION": 0, "T2_CLUSTER_ID": null, "T2_LIVY_BATCH_ID": null, "T2_SPARK_APP_ID": null, "T2_SPARK_UI_URL": null, "T2_SPARK_LOG_URL": null, "T2_PROCESS_START_DATE": "2019-06-07T08:22:55.000Z", "T2_PROCESS_END_DATE": "2019-06-07T08:22:55.000Z", "T2_EXECUTION_STATUS": "TODO", "T2_ERROR": null, "T2_ERROR_TRACE": null, "ANALYZE_STATUS": "NONE", "ANALYZE_EXECUTION_DAYS": 7, "ANALYZE_LAST_SUCCESS_DATE": null, "ANALYZE_PROCESS_START_DATE": null, "ANALYZE_PROCESS_END_DATE": null, "ANALYZE_EXECUTION_STATUS": "NONE", "ANALYZE_ERROR": null, "ANALYZE_ERROR_TRACE": null, "UPDATE_DATE": "2019-06-07T08:22:55.000Z", "UPDATED_BY": "USER" };
  constructor(
    private formBuilder: FormBuilder,
    private recordService: RecordService,
    private router: Router,
    private loadControlService: LoadControlService
  ) {
    this.loadControl = LoadControl;
  }
  ngOnInit() {
    this.formInit();
    // this.recordService.currentRecord.subscribe(record => this.record = record);
    // if (this.record) {
    //   this.newRecord = false;
    //   for (var _i = 0; _i < this.loadControl.length; _i++) {
    //     const columnName = this.loadControl[_i].columnName;
    //     // this.loadControl[_i][columnName] = this.record[columnName];
    //     if (this.loadControl[_i].dataType == "TIMESTAMP") {
    //       this.record[columnName] = new Date(this.record[columnName]);
    //     }
    //     if (this.loadControl[_i].valueSet) {
    //       const tempArray = this.loadControl[_i].valueSet.split(',').map(item => item.trim());;
    //       this.loadControl[_i].valueSetNew = tempArray;
    //     }
    //   }
    // }
    // else {
    //   this.newRecord = true;
    //   for (var _i = 0; _i < this.loadControl.length; _i++) {
    //     const columnName = this.loadControl[_i].columnName;
    //     this.record[columnName] = null;
    //     if (this.loadControl[_i].valueSet) {
    //       const tempArray = this.loadControl[_i].valueSet.split(',').map(item => item.trim());;
    //       this.loadControl[_i].valueSetNew = tempArray;
    //     }
    //   }

    //   // this.router.navigate(['/loadcontrol']);
    // }
    let test = JSON.stringify(this.temprecord);
    this.record = JSON.parse(test);
    this.editLoadControlForm.setValue(this.record);

    // Set form data
    const formControls = this.editLoadControlForm.controls;
    for (const key in formControls) {
      if (formControls.hasOwnProperty(key)) {
        const element = formControls[key];
        if (this.record[key] && Object.keys(this.record[key]).length > 0 && this.record[key].constructor === Object) {
          element.patchValue(this.record[key].data[0]);
        } else {
          element.patchValue(this.record[key]);
        }
      }
    }

  }

  formInit() {
    this.editLoadControlForm = this.formBuilder.group({
      SCHEMA_NAME: ['', Validators.required],
      TABLE_NAME: ['', Validators.required],
      ENV_NAME: ['', Validators.required],
      TARGET_SCHEMA_NAME: ['', Validators.required],
      TARGET_TABLE_NAME: ['', Validators.required],
      EMAIL_ALERTS: ['', Validators.required],
      TABLE_SOURCE: ['', Validators.required],
      LOAD_STRATEGY: ['', Validators.required],
      RAW_FACTORY_PATH: [''],
      RAW_FACTORY_RETENTION_STRATEGY: [''],
      RAW_FACTORY_RETENTION_DAYS: [0],
      DB_ID: [''],
      DB_SCHEMA: [''],
      DB_TABLE: [''],
      DB_TABLE_PK_COLUMNS: [''],
      DB_TABLE_UPDATE_DATE_COLUMN: [''],
      T1_PATH: [''],
      T1_RETENTION_STRATEGY: [''],
      T1_RETENTION_DAYS: [0],
      T2_T3_RETENTION_STRATEGY: [''],
      T2_T3_RETENTION_DAYS: [0],
      ETL_STATUS: [''],
      // ETL_STATUS_REASON: [''],
      ETL_DAG_NAME: [''],
      ETL_DAG_RUN_ID: [''],
      ETL_DAG_RUN_URL: [''],
      ETL_PROCESS_START_DATE: [''],
      ETL_PROCESS_END_DATE: [''],
      ETL_EXECUTION_STATUS: [''],
      ETL_PROCESS: [''],
      T1_STATUS: [''],
      T1_BATCH_IN_DAYS: [0, Validators.required],
      T1_MAX_LOAD_END_DATE: [''],
      T1_CLUSTER_ID: [''],
      T1_LIVY_BATCH_ID: [''],
      T1_SPARK_APP_ID: [''],
      T1_SPARK_UI_URL: [''],
      T1_SPARK_LOG_URL: [''],
      T1_PROCESS_START_DATE: [''],
      T1_PROCESS_END_DATE: [''],
      T1_EXECUTION_STATUS: [''],
      T1_ERROR: [''],
      T1_ERROR_TRACE: [''],
      T2_STATUS: [''],
      T2_INSERT_DIR_BATCH_SIZE: [0, Validators.required],
      T2_PARTITION_JOB_TYPE: ['', Validators.required],
      T2_MAX_LOAD_END_DATE: [''],
      T2_MAX_ATLAS_VERSION: [0],
      T2_CLUSTER_ID: [''],
      T2_LIVY_BATCH_ID: [''],
      T2_SPARK_APP_ID: [''],
      T2_SPARK_UI_URL: [''],
      T2_SPARK_LOG_URL: [''],
      T2_PROCESS_START_DATE: [''],
      T2_PROCESS_END_DATE: [''],
      T2_EXECUTION_STATUS: [''],
      T2_ERROR: [''],
      T2_ERROR_TRACE: [''],
      ANALYZE_STATUS: [''],
      ANALYZE_EXECUTION_DAYS: [0, Validators.required],
      ANALYZE_LAST_SUCCESS_DATE: [''],
      ANALYZE_PROCESS_START_DATE: [''],
      ANALYZE_PROCESS_END_DATE: [''],
      ANALYZE_EXECUTION_STATUS: [''],
      ANALYZE_ERROR: [''],
      ANALYZE_ERROR_TRACE: [''],
      UPDATE_DATE: ['', Validators.required],
      UPDATED_BY: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.editLoadControlForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.editLoadControlForm.invalid) {
      return;
    }

    this.router.navigate(['/loadcontrol']);
  }

  ngOnDestroy() {
    this.record = null;
  }

  saveRecord(operation: string): void {
    console.log("After save click:" + this.record);
    const body = {
      operation: operation,
      record: this.record
    };
    this.router.navigate(['/loadcontrol']);
    // this.loadControlService.updateRecord(body).subscribe((data: any) => {
    //   console.log(data);
    // });
  }
}