import { Component, OnInit, Directive, ViewChild } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { UniqueIdentifierCodeI } from '../../models/uic/uic.interface';
import { AppComponent } from 'src/app/app.component';
import * as XLSX from 'xlsx'; 
import { Guid } from "guid-typescript"


@Component({
  selector: 'app-uic',
  templateUrl: './uic.component.html',
  styleUrls: ['./uic.component.css']
})

/*@Directive({selector: 'child-directive'})
class ChildDirective {
}*/


export class UicComponent implements OnInit {

  @ViewChild('alertContainer', { static: true })
  //@ViewChild(ChildDirective) child!: ChildDirective;
  public titleContainer: any;
  public newAlertElement: any;
  @ViewChild('modalContainer', { static: true })
  //@ViewChild(ChildDirective) child!: ChildDirective;
  public modalTitleContainer: any;
  public modalNewAlertElement: any;
  loggedDoctorId = '';
  loggedProfile = '';
  loggedDoctorEmail = '';
  obtainedUniqueIdentifierCodesByDoctor: UniqueIdentifierCodeI[] = [];
  filteredUniqueIdentifierCodesByDoctor: UniqueIdentifierCodeI[] = [];
  newCreatedUIC!: UniqueIdentifierCodeI;  

  constructor(private doctorService : DoctorDataService, private appComponent : AppComponent) { };


  ngOnInit(): void {
    this.loggedDoctorId = this.appComponent.loggedId;
    this.loggedProfile = this.appComponent.profile;
    this.loggedDoctorEmail = this.appComponent.userEmail;
    this.createNewUIC();
    this.getUICByDoctorId("");
  }

  createAlertMessage(alertMessage : string){
    this.newAlertElement = document.createElement("div");
    this.newAlertElement.innerHTML = '<div class="alert alert-success alert-dismissible fade show" role="alert">' + 
    alertMessage + 
    '<button id="closeButton" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    this.titleContainer.nativeElement.appendChild(this.newAlertElement);
    this.closeAlertMessage();
  }

  closeAlertMessage() {
    setTimeout( () => { 
      let closeButton : HTMLElement = document.getElementById("closeButton") as HTMLElement;
      //console.log(closeButton)
      closeButton.click();
      }, 5000);
  }

  getUICByDoctorId(filteredStatus : string) {
    this.doctorService.getAllUICByDoctor(this.loggedDoctorId).subscribe(data => {
      this.obtainedUniqueIdentifierCodesByDoctor = data;
      if (filteredStatus.length > 0) {
        this.filterByState(filteredStatus);
      } else {
        this.filteredUniqueIdentifierCodesByDoctor = this.obtainedUniqueIdentifierCodesByDoctor;
      }
      //console.log(this.filteredUniqueIdentifierCodesByDoctor.length)
    });     
  }

  createNewUIC(){
    this.newCreatedUIC = {
      id: Guid.create().toString(),
      status: "Pendiente",
      creationDate: this.defineNewDate(new Date()),
      doctorId: this.loggedDoctorId,
      modificationDate: this.defineNewDate(new Date())
    }
  }

  saveNewUIC(){
    /*const newUIC = {
      id: Guid.create().toString(),
      status: "Pendiente",
      creationDate: new Date(),
      doctorId: this.loggedDoctorId
    }*/
    this.doctorService.addNewUIC(this.newCreatedUIC).subscribe(data => {
      this.getUICByDoctorId("Pendiente");
      this.createAlertMessage("CUI generado con ??xito")
    });    
  }
  


  onUpdateUIC(receivedId: string, receivedStatus : string, receivedCeationDate : Date, receivedDoctorId : string, filteredStatus : string ): void {
    const actualUIC = {
      status: receivedStatus,
      creationDate: receivedCeationDate,
      doctorId: receivedDoctorId,
      modificationDate: this.defineNewDate(new Date())
    }
    this.doctorService.updateUIC(actualUIC, receivedId).subscribe(data => {
      this.getUICByDoctorId(filteredStatus);
      this.createAlertMessage("CUI actualizado con ??xito")
    });    
  }

  onDeleteUIC(receivedId: string, filteredStatus: string) : void {
    this.doctorService.deleteUIC(receivedId).subscribe(data => {
      this.getUICByDoctorId(filteredStatus);
      this.createAlertMessage("CUI eliminado con ??xito")
    });
  }

  filterByState(selectedStatus: string) {
    this.filteredUniqueIdentifierCodesByDoctor = this.obtainedUniqueIdentifierCodesByDoctor.filter(uniquecode => uniquecode.status == selectedStatus)
  }

  sendUICByEmail(receivedId: string) {
    this.doctorService.sendNotificationUICById(receivedId, this.loggedDoctorEmail).subscribe(data => this.createAlertMessage("Email env??ado con ??xito"));
    
  }

  fileName= 'UICExcelSheet.xlsx';  

  exportexcel(): void { 
    let element = document.getElementById('excel-table'); 
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, this.fileName);
        
  }

  defineNewDate(date : Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()))
  }

}
