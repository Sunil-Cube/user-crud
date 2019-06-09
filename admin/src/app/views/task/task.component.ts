import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

//import { PuzzlecategoryService } from '../../services/puzzlecategory.service';

//import { PuzzlecatepopupComponent } from './puzzlecatepopup/puzzlecatepopup.component';
//import { EditpuzzlecatepopupComponent } from './editpuzzlecatepopup/editpuzzlecatepopup.component';


import { TaskService } from '../../services/task.service';

import { AddtaskpopupComponent } from './addtaskpopup/addtaskpopup.component';
import { EdittaskpopupComponent } from './edittaskpopup/edittaskpopup.component';




//import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;  
}


@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit 
{
    dtOptions: DataTables.Settings = {};    
    persons: any = [];
    m_persons: any = [];
    bsModalRef: BsModalRef;
    private subscriptions;
    subAdminList: any = [];
    
    /**************datatable related variable*****************************************/
    currentPage = 1;
    totalItem = 0;
    offset = 0;
    smallnumPages = 0;
    page: any = 1;
    limit = 10;
    sort_type: any;
    sort_field: any;
    showPagination: Boolean = false;
    isDataLoading: Boolean = false;
    isFilter: Boolean = false;
    params: any = {};
    categoriesList: any = [];
    resData: any;
    fieldNameUsed: any;
    order_type: any = 'asc';
    objectKeys = Object.keys;
 

  constructor(
    private fb: FormBuilder,
    private router: Router,    
    private puzzlecategoryService: TaskService,
    private toastrService: ToastrService,
    private modalService: BsModalService,
    //private _swal2: Swal,
    )
  { 

  }

  ngOnInit() 
  {
    //this.getlisting();

    this.getCategories(this.offset, this.limit);
  }

  getCategories(offset: number, limit: number, resetPagination: Boolean = false) 
  {
    
     this.isDataLoading = true;
     let sort;
      if (this.sort_type) 
      {
        sort = { 'colId': this.sort_field, 'sort': this.sort_type };
      } 
      else 
      {
        sort = {};
      }

      let filter = {};

      if (this.isFilter) 
      {
        filter = Object.assign({}, this.params);
        
          if(this.params.date) 
          {
            const obj = {};
            filter['name'] = obj;
          }
      }


      this.puzzlecategoryService.getCategories(offset, limit, sort, filter).subscribe(response => 
        {
        this.isDataLoading = false;
        this.resData = response;
  
        if (response.status === 200) {
          this.categoriesList = this.resData.data.rows;
          for (let i = 0; i < this.categoriesList.length; i++) 
          {
            const status = (this.categoriesList[i].status === 1) ? true : false;
            const task_status = (this.categoriesList[i].task_status === 1) ? true : false;
            this.categoriesList[i].displayStatus = status;

            this.categoriesList[i].displaytaskStatus = task_status;
            
          }
  
          if (this.offset === 0) {
            this.totalItem = this.resData.data.count;
          }
  
          this.showPagination = true;
          if (resetPagination) {
            this.currentPage = 1;
          }
        } else {
          this.toastrService.error('', this.resData.message);
        }
      }, err => {
        this.isDataLoading = false;
      });
  }

  // /* This function is call when page change*/
  pageChanged(event: any, resetPagination: Boolean = false): void 
  {
    this.page = event.page;
    this.offset = ((this.page - 1) * this.limit);
    this.getCategories(this.offset, this.limit, resetPagination);
  }

  // /* This function is use for sorting */
  sorting() {
    if (this.totalItem > 10) {
      const event = { page: 1 };
      this.showPagination = false;
      this.pageChanged(event, true);
    }
  }

  /* This function is use for reset filter */
  resetFilter() {
    this.params = {};
    if (this.isFilter) {
      this.isFilter = false;
      const event = { page: 1 };
      this.showPagination = false;
      this.pageChanged(event, true);
    }
  }

  /* This function is use for filter data */
  filterData() {
    for (const propName in this.params) {
      if (this.params[propName] === null || this.params[propName] === undefined || this.params[propName] === "") {
        delete this.params[propName];
      }
    }

    /*Use for check that filter value has object contains */
    if (Object.keys(this.params).length === 0 && this.params.constructor === Object) {
      this.isFilter = false;
    } else {
      this.isFilter = true;
    }

    const event = { page: 1 };
    this.showPagination = false;
    this.pageChanged(event, true);
  }

  // /*This function is use for sorting */
  headerSort(field_name, order_type) 
  {
    this.sort_field = field_name;
    if (!this.fieldNameUsed) 
    {
        this.fieldNameUsed = this.sort_field;
        this.sort_type = order_type;
        if (order_type === 'asc') 
        {
          this.order_type = 'desc';
        } else 
        {
          this.order_type = 'asc';
        }
    } else if (this.fieldNameUsed === field_name) 
    {
        this.sort_type = order_type;
        if (order_type === 'asc') {
          this.order_type = 'desc';
        } else {
          this.order_type = 'asc';
        }
    } else {
        this.fieldNameUsed = field_name;
        this.order_type = 'desc';
        this.sort_type = 'asc';
    }
      const event = { page: 1 };
      this.showPagination = false;
      this.pageChanged(event, true);
  }



  getlisting() 
  {
    //const that = this;

    console.log('now function is calling ....');

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 2,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.puzzlecategoryService.getStudentList(dataTablesParameters)
          .subscribe(resp => {
            console.log('respresprespresp',resp.body['data']);
            let res = resp.body['data']
            this.persons = res.totalData;
            this.m_persons = resp.body['data'];
            

            callback({
              //recordsTotal: res.totalCount[0].count,
              //recordsFiltered: res.totalCount[0].count,
              recordsTotal: 0,
              recordsFiltered: 0,

              data: []
            });
            
          });
      },
      columns: [{ data: 'id' }, { data: 'name' }, { data: 'created_at' },{data: ''}]
    };
  }
  
  openpuzzlecategoryModal(type,data = {}, index = 0)
  {
 
       if(type=='add')
       { 
            const initialState = 
                {
                  type: type,
                  subAdminData: data,
                  class: "modal-lg"
                };
              this.bsModalRef = this.modalService.show(AddtaskpopupComponent, 
                {
                initialState, class: 'modal-lg', backdrop: true, ignoreBackdropClick: true
              });

              this.subscriptions = this.modalService.onHide.subscribe((reason: string) => {
                if (this.bsModalRef.content.type === 'success') {

                  this.getCategories(0, this.limit, true);
                  
                }
                this.subscriptions.unsubscribe();
              });

       } 
       else if(type=='edit')
       {
        var record_edit = this.categoriesList[index];

          var custom_obj = {
            member_name:record_edit.member_name[0],
            name:record_edit.name,
            status:record_edit.status,            
            _id:record_edit._id
        };


            const initialState = {
                  type: type,
                  subAdminData: custom_obj,
                  class: "modal-lg"
            };

            this.bsModalRef = this.modalService.show(EdittaskpopupComponent, 
              {
                initialState,class: 'modal-lg', backdrop: true, ignoreBackdropClick: true
            });           

            this.subscriptions = this.modalService.onHide.subscribe((reason: string) => {
              if (this.bsModalRef.content.type === 'edit') {

                this.getCategories(0, this.limit, true);
                
              }
              this.subscriptions.unsubscribe();
            });

       }
       this.getCategories(this.offset, this.limit);

  } 



   updateStatus(status, categoryId, i, displayStatus,check_status)
    {

          if(check_status=='status')
          {
               var message = 'You want to update task status';
                var text_title = 'Task Status';
                var text_message = 'Task Update successfully';
          }
          else{
            var message = 'You want to update task complete or pending status';
             var text_title = 'Task Complete/Pending';
             var text_message = 'task Complete/Pending Update successfully';
          }
          
        Swal.fire({
          title: 'Are you sure?',
          text: message,
          type: 'warning',
          showCancelButton: true, allowOutsideClick: false, allowEscapeKey: false,
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel'
        }).then((result) => 
        {
          //const disStatus = !displayStatus;
          const statusVal = (status === 1) ? 0 : 1;

          if (result.value) 
          {              
              this.toastrService.clear();
              
              let api_url = 'update_status_task'; 

              this.puzzlecategoryService.past_data_to_server(api_url,{ member_id: categoryId,status: statusVal,check_status:check_status}).subscribe(response => {
                
                this.toastrService.success(text_message,text_title);

                this.getCategories(this.offset, this.limit);
             }, error => {          
               this.toastrService.error('', error.error.message);
             });
             

          }
        });
    }
  

}
