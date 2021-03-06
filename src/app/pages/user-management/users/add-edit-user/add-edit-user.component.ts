import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef, MessageService } from 'primeng/api';
import { UsersService } from 'src/app/services/users.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss']
})

export class AddEditUserComponent implements OnInit {

  addEditForm: FormGroup;
  selectedUser: any;
  users: any;
  roles: any;
  submitted: boolean = false;
  isNew: boolean = true;
  appState: any;
  constructor(
    private formBuilder: FormBuilder,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private usersService: UsersService,
    private messageService: MessageService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.appState = this.commonService.getState();
    this.selectedUser = this.config.data.selectedUser;
    this.users = this.config.data.users;
    this.roles = this.config.data.roles;
    this.isNew = this.config.data.isNew;
    this.formInit();
  }

  formInit() {
    this.addEditForm = this.formBuilder.group({
      USER_NAME: [this.selectedUser.USER_NAME, Validators.required],
      FULL_NAME: [this.selectedUser.FULL_NAME],
      EMAIL_ID: [this.selectedUser.EMAIL_ID,Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')],
      ROLE: [this.selectedUser.ROLE, Validators.required],
    });
  }

  get f() {
    return this.addEditForm.controls;
  }


  submit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.addEditForm.invalid) {
      return;
    }

    let formValues = Object.assign({}, this.addEditForm.value);
    let tempUser = formValues;
    tempUser.UPDATE_DATE = `${new Date()}`;
    if (this.appState.loggedInUser && this.appState.loggedInUser.USER_NAME) {
      tempUser.UPDATED_BY = this.appState.loggedInUser.USER_NAME;
    }
    if (this.isNew) {
      const body = {
        user: tempUser
      };
      this.usersService.addUser(body).subscribe((data: any) => {
        this.showToast('success', 'user saved.');
        this.closeModal(true);
      }, error => {
        this.showToast('error', 'Could not save user.');
      });
    }
    else {
      tempUser.ID = this.selectedUser.ID;
      const body = {
        user: tempUser
      };
      this.usersService.updateUser(body).subscribe((data: any) => {
        this.showToast('success', 'User updated.');
        this.closeModal(true);
      }, error => {
        this.showToast('error', 'Could not update user.');
      });
    }
  }

  closeModal(status) {
    this.ref.close(status);
  }

  showToast(severity, summary) {
    this.messageService.add({ severity, summary, life: 3000 });
  }

}
