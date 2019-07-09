import { environment } from '../../environments/environment';
// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common.service';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class HeaderHashService {

    constructor(
        private commonService: CommonService,
        private http: HttpClient,
    ) {
    }

    getHeaders(tableData) {
        const url = `${environment.baseUrl}header-hash`;
        return this.http
            .post(url, tableData)
            .pipe(catchError(this.commonService.handleError));
    }

    getAllTables() {
        const url = `${environment.baseUrl}header-hash/getAllTables`;
        return this.http
            .get(url)
            .pipe(catchError(this.commonService.handleError));
    }

    approveHeader(header) {
        const url = `${environment.baseUrl}header-hash/approveHeader`;
        return this.http
            .put(url, header)
            .pipe(catchError(this.commonService.handleError));
    }


    updateTasks(tableData) {
        const url = `${environment.baseUrl}header-hash`;
        return this.http
            .put(url, tableData)
            .pipe(catchError(this.commonService.handleError));
    }
}