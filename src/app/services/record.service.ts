import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class RecordService {

    private recordSource = new BehaviorSubject('');
    currentRecord = this.recordSource.asObservable();

    constructor() { }

    changeActiveRecord(record: string) {
        this.recordSource.next(record);
    }

}