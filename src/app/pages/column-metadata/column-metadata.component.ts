import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/components/table/table';
import { MessageService } from 'primeng/api';

import { MetadataMappingComponent } from './metadata-mapping/metadata-mapping.component';
import { ColumnMetadataService } from 'src/app/services/column-metadata.service';
import { CommonService } from 'src/app/services/common.service';
import { columnTableColumns, versionTableColumns } from './tableColumns';
import { Router } from '@angular/router';


@Component({
  selector: 'app-column-metadata',
  templateUrl: './column-metadata.component.html',
  styleUrls: ['./column-metadata.component.scss'],
  providers: [DialogService, ConfirmationService]
})
export class ColumnMetadataComponent implements OnInit {

  versions = [];
  showMetaData = false;
  selectedVersion: any;
  versionData = [];
  loader = {
    columns: false,
    versions: false,
    delete: false,
    save: false
  };
  state: any;
  uniqueTables: any;
  selectedTableName: any;
  showGenerateVersion = true;
  isFirstNewVersion: any = null;
  selectedTable: any;
  columnTableColumns = columnTableColumns;
  versionTableColumns = versionTableColumns;
  @ViewChild(Table, { static: false }) tableComponent: Table;
  selectedColumns: any;
  errors: any = {
    hasError: false
  };

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private columnMetadataService: ColumnMetadataService,
    private commonService: CommonService,
    public dialogService: DialogService
  ) { }

  ngOnInit() {
    this.getAllTables();
    this.state = this.commonService.getState();
    if (this.state.CMV && this.state.CMV.selectedTable) {
      this.selectedTable = this.state.CMV.selectedTable;
      this.getVersions();
    }
    this.getSelectedColumns();
  }

  getSelectedColumns() {
    if (!localStorage.getItem('selectedVersionColumns')) {
      this.initColumnState();
    } else {
      this.selectedColumns = JSON.parse(localStorage.getItem('selectedVersionColumns'));
    }
  }

  saveColumnState() {
    localStorage.setItem('selectedVersionColumns', JSON.stringify(this.selectedColumns));
    this.resetFilters();
  }

  resetFilters() {
    const statefilter = JSON.parse(localStorage.getItem('stateSelectedVersionColumns'));
    if (statefilter) {
      localStorage.removeItem('stateSelectedVersionColumns');
    }
    this.tableComponent.reset();
  }

  initColumnState() {
    this.selectedColumns = columnTableColumns;
  }

  checkStateUpdateSelectedTable() {
    if (this.state.CMV && this.state.CMV.selectedTable) {
      const selectedVersion = this.versions.filter(i => i.METADATA_VERSION === this.state.CMV.selectedTable.METADATA_VERSION);
      if (selectedVersion && selectedVersion.length) {
        this.viewData(selectedVersion[0]);
      }
    }
  }

  getAllTables() {
    this.columnMetadataService.getAllTablesInVersions().subscribe((resp: any) => {
      if (resp.data && resp.data.length) {
        this.uniqueTables = this.removeDuplicates(resp.data, 'TABLE_NAME');
        if (!this.state.CMV || !this.state.CMV.selectedTable) {
          this.selectedTable = this.uniqueTables[0];
          this.viewData(this.selectedTable);
          this.getVersions();
        } else {
          const selectedTableName = this.uniqueTables.filter(i => i.TABLE_NAME === this.state.CMV.selectedTable.TABLE_NAME);
          if (selectedTableName && selectedTableName.length) {
            this.selectedTableName = selectedTableName[0];
          }
        }
      }
    });
  }

  removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  getVersions() {
    this.showGenerateVersion = true;
    this.loader.versions = true;
    const request = { table_name: this.selectedTable.TABLE_NAME };
    this.columnMetadataService.getTableVersions(request).subscribe((resp: any) => {
      this.versions = resp.data;
      this.loader.versions = false;
      this.checkStateUpdateSelectedTable();
      this.versions.forEach((element, index) => {
        if (element.STATUS.toLowerCase() === 'new') {
          this.showGenerateVersion = false;
          if (!this.isFirstNewVersion) {
            this.isFirstNewVersion = index;
          }
        }
      });
    }, error => {
      this.loader.versions = false;
    });
  }

  changeTable() {
    this.state.CMV = { ...this.state.CMV, selectedTable: this.selectedTableName };
    this.commonService.setState(this.state);
    this.ngOnInit();
  }

  viewData(version) {
    this.state.CMV = { ...this.state.CMV, selectedTable: version };
    this.commonService.setState(this.state);
    this.selectedVersion = version;
    this.loader.columns = true;
    const request = {
      table_name: this.selectedTable.TABLE_NAME,
      columnVersion: version.METADATA_VERSION
    };
    let localCopyOfVersion = this.columnMetadataService.getLocalCopyOfVersion();
    if (!localCopyOfVersion) {
      this.columnMetadataService.getAllColumns(request).subscribe((resp: any) => {
        this.versionData = resp.data;
        this.loader.columns = false;
        this.showMetaData = true;
        if (version.STATUS === 'NEW') {
          localCopyOfVersion = {
            [`${version.METADATA_VERSION}_${version.TABLE_NAME}`]: this.versionData
          };
          this.columnMetadataService.setLocalCopyOfVersion(localCopyOfVersion);
        }
      }, error => {
        this.loader.columns = false;
      });
    } else {
      this.versionData = localCopyOfVersion[`${version.METADATA_VERSION}_${version.TABLE_NAME}`];
      console.log('this.versionData ', this.versionData);
      this.showMetaData = true;
      this.loader.columns = false;
    }
  }

  deleteColumn(version) {
    if (version.action === 'deleted') {
      this.confirmationService.confirm({
        message: 'Would you like to undo delete?',
        accept: () => {
          this.loader.delete = true;
          const localCopyOfVersion = this.columnMetadataService.getLocalCopyOfVersion();
          localCopyOfVersion[`${version.METADATA_VERSION}_${version.TABLE_NAME}`] =
            localCopyOfVersion[`${version.METADATA_VERSION}_${version.TABLE_NAME}`]
              .map(i => {
                if (i.TARGET_COLUMN_ID === version.TARGET_COLUMN_ID) {
                  delete i.action;
                }
                return i;
              });
          this.columnMetadataService.setLocalCopyOfVersion(localCopyOfVersion);
          this.loader.delete = false;
          this.ngOnInit();
        }
      });
    } else {

      this.confirmationService.confirm({
        message: 'Are you sure that you want to delete this column?',
        accept: () => {
          this.loader.delete = true;
          const localCopyOfVersion = this.columnMetadataService.getLocalCopyOfVersion();
          localCopyOfVersion[`${version.METADATA_VERSION}_${version.TABLE_NAME}`] =
            localCopyOfVersion[`${version.METADATA_VERSION}_${version.TABLE_NAME}`]
              .map(i => {
                if (i.TARGET_COLUMN_ID === version.TARGET_COLUMN_ID) {
                  i.action = 'deleted';
                }
                return i;
              });
          this.columnMetadataService.setLocalCopyOfVersion(localCopyOfVersion);
          this.loader.delete = false;
          this.ngOnInit();
        }
      });
    }
  }

  editColumn(version) {
    this.columnMetadataService.setColumnToEdit(version);
    this.router.navigate(['/CMV/edit-column', version.METADATA_VERSION, version.TARGET_COLUMN_ID || 'new']);
  }

  validate(version) {
    this.columnMetadataService.validateVersion({ version }).subscribe((resp: any) => {
      if (resp && !resp.error) {
        this.showToast('success', 'Version Validated!');
        this.isFirstNewVersion = null;
        this.ngOnInit();
      } else {
        this.showToast('error', 'Could not validate version.');
      }
    }, error => {
      this.showToast('error', 'Could not validate version.');
    });
  }

  checkForDuplicatesInArray(array) {
    const uniq = array
      .map((name) => {
        return {
          count: 1,
          name
        };
      })
      .reduce((a, b) => {
        a[b.name] = (a[b.name] || 0) + b.count;
        return a;
      }, {});
    const duplicates = Object.keys(uniq).filter((a) => uniq[a] > 1);
    return duplicates;
  }

  saveChanges() {
    this.errors = {
      hasError: false
    };
    // Check CMV Validations
    const localCopyOfVersion = this.columnMetadataService.getLocalCopyOfVersion();
    const colums = localCopyOfVersion[this.selectedVersion.METADATA_VERSION + '_' + this.selectedVersion.TABLE_NAME];
    // Check Unique Target Target Column Name
    const targetColumnNames = colums.map(i => i.TARGET_COLUMN_NAME);
    const checkDuplicatetTargetNames = this.checkForDuplicatesInArray(targetColumnNames);
    if (checkDuplicatetTargetNames && checkDuplicatetTargetNames.length) {
      this.errors.hasError = true;
      this.errors.duplicatetTargetNames = checkDuplicatetTargetNames;
    }
    // Check Unique Combination of SRC_COLUMN_NAME & LOOKUP_TABLE_ALIAS
    const srcAndTableAlias = colums.map(i => {
      if (i.LOOKUP_TABLE_ALIAS) {
        return `${i.SRC_COLUMN_NAME}+${i.LOOKUP_TABLE_ALIAS ? i.LOOKUP_TABLE_ALIAS : ''}`;
      }
    });
    const checkSrcAndTableAlias = this.checkForDuplicatesInArray(srcAndTableAlias);
    if (checkSrcAndTableAlias && checkSrcAndTableAlias.length) {
      this.errors.hasError = true;
      this.errors.checkSrcAndTableAlias = checkSrcAndTableAlias;
    }
    // Check IS_PARTITION_COLUMN should be only 1
    let isPartitionColumn = colums.map(i => {
      if (i.IS_PARTITION_COLUMN === 1 ||
        i.IS_PARTITION_COLUMN === true || (i.IS_PARTITION_COLUMN && i.IS_PARTITION_COLUMN.data && i.IS_PARTITION_COLUMN.data[0])) {
        return i.SRC_COLUMN_NAME;
      }
    });
    isPartitionColumn = isPartitionColumn.filter(i => i !== undefined);
    if (isPartitionColumn && isPartitionColumn.length) {
      this.errors.hasError = true;
      this.errors.isPartitionColumn = isPartitionColumn;
    }
    // Partition Column Should have TARGET_DATA_TYPE as varchar
    let isPartitionColumn2 = colums.map(i => {
      if (i.IS_PARTITION_COLUMN === 1 ||
        i.IS_PARTITION_COLUMN === true || (i.IS_PARTITION_COLUMN && i.IS_PARTITION_COLUMN.data && i.IS_PARTITION_COLUMN.data[0])) {
        return `${i.SRC_COLUMN_NAME}+${i.TARGET_DATA_TYPE}`;
      }
    });
    isPartitionColumn2 = isPartitionColumn2.filter(i => i !== undefined);
    isPartitionColumn2 = isPartitionColumn2.map(i => {
      const checkDataType = i.split('+')[1];
      if (!/^int|varchar/g.test(checkDataType)) {
        return i.split('+')[0];
      }
    });
    isPartitionColumn2 = isPartitionColumn2.filter(i => i !== undefined);
    if (isPartitionColumn2 && isPartitionColumn2.length) {
      this.errors.hasError = true;
      this.errors.isPartitionColumnDataType = isPartitionColumn2;
    }
  }

  generateNewVersion() {
    this.loader.columns = true;
    const allVersions = [];
    this.versions.forEach(element => {
      allVersions.push(element.METADATA_VERSION);
    });
    const request = {
      table_name: this.selectedTable.TABLE_NAME,
      version: Math.max(...allVersions)
    };
    this.columnMetadataService.generateNewVersion(request).subscribe((resp: any) => {
      if (resp && !resp.error) {
        this.showToast('success', 'Version Created!');
        this.ngOnInit();
      } else {
        this.showToast('error', 'Could not create version.');
      }
      this.loader.columns = false;
    }, error => {
      this.showToast('error', 'Could not create version.');
      this.loader.columns = false;
    });
  }

  showMapping(metadataVersion) {
    const ref = this.dialogService.open(MetadataMappingComponent, {
      header: 'Column Version Mapping',
      width: '45%',
      data: metadataVersion
    });
  }

  showToast(severity, summary) {
    this.messageService.add({ severity, summary, life: 3000 });
  }

}
