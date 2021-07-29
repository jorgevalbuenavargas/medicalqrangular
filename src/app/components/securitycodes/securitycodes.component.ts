import { Component, OnInit, ViewChild } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { SecurityCodeI } from '../../models/securitycode/securitycode.interface';
import { AppComponent } from 'src/app/app.component';
import { Guid } from "guid-typescript";
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-securitycodes',
  templateUrl: './securitycodes.component.html',
  styleUrls: ['./securitycodes.component.css']
})
export class SecuritycodesComponent implements OnInit {

  @ViewChild('alertContainer', { static: true }) 
  public titleContainer: any;
  public newAlertElement: any;
  loggedDoctorId = ''
  loggedProfile = ''
  loggedDoctorEmail = ''
  securityCode!: SecurityCodeI;
  securityCodeNumber = ''
  securityCodeCreationDate!: Date;
  obtainedSecurityCodesByDoctor : SecurityCodeI[] = [];
  lastMonth = new Date().getFullYear() + "-" + this.getRealMonth(new Date().getMonth()) + "-01";
  today = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).getFullYear() + '-12-31'
  fromDate: any;
  toDate: any;
  filteredobtainedSecurityCodes: SecurityCodeI[] = [];

  constructor(private doctorService : DoctorDataService, private appComponent : AppComponent) { }

  filtersForm = new FormGroup({
    fromDate: new FormControl({value: this.lastMonth, disabled: false}),
    toDate: new FormControl({value: this.today, disabled: false}),
    state: new FormControl({value: '', disabled: false}),
    doctorMedicalLicense: new FormControl({value: '', disabled: false}),
    doctorLastName: new FormControl({value: '', disabled: false}),
    doctorName: new FormControl({value: '', disabled: false})
    
  });

  ngOnInit(): void {
    this.loggedDoctorId = this.appComponent.loggedId;
    this.loggedProfile = this.appComponent.profile;
    this.loggedDoctorEmail = this.appComponent.userEmail;
    this.getSecurityCodeByDoctorId();
    this.createAlertMessage("¡Bienvenido!", "success")
  }

  getRealMonth(receivedMonth : number){
    let month : string[] = [];
    month[0] = "01";
    month[1] = "02";
    month[2] = "03";
    month[3] = "04";
    month[4] = "05";
    month[5] = "06";
    month[6] = "07";
    month[7] = "08";
    month[8] = "09";
    month[9] = "10";
    month[10] = "11";
    month[11] = "12";
    return month[receivedMonth]
  }

  onSubmit(){
    //this.toDate = this.filtersForm.controls.toDate.value      
    if (this.filtersForm.controls.fromDate.value.length > 0) {
      this.fromDate = this.filtersForm.controls.fromDate.value;
    } else {
      this.fromDate = '2001-01-01'
    }  
    if (this.filtersForm.controls.toDate.value.length > 0) {
      this.toDate = this.filtersForm.controls.toDate.value;
    } else {
      this.toDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).getFullYear() + '-12-31'
    }
    if (this.fromDate > this.toDate) {
      this.createAlertMessage("La fecha desde no puede ser superior a la fecha hasta.", "danger")
    } else {               
      this.filterByDates(this.fromDate, this.toDate)
    }  
  }

  filterByDates(fromDate: string, toDate: string) {

    const dateFrom = new Date(fromDate)
    const dateTo = new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1))
    dateTo.setSeconds(dateTo.getSeconds() - 1)
    this.filteredobtainedSecurityCodes = [];
    for (let securityCode of this.obtainedSecurityCodesByDoctor) {
      if (this.defineNewDate(new Date(securityCode.expirationDate)) >= dateFrom && this.defineNewDate(new Date(securityCode.expirationDate)) <= dateTo) { 
        this.filteredobtainedSecurityCodes.push(securityCode)
      }
    }
    if (this.filteredobtainedSecurityCodes.length == 0) {
      this.createAlertMessage("No se encontraron resultados para el rango de fechas indicado.", "danger")
    }  
  }

  createAlertMessage(alertMessage : string, alertType : string){
    this.newAlertElement = document.createElement("div");
    this.newAlertElement.innerHTML = '<div class="alert alert-'+alertType+' alert-dismissible fade show" role="alert">' + 
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

  getSecurityCodeByDoctorId() {
    this.doctorService.getAllSecurityCodesByDoctor(this.loggedDoctorId).subscribe(data => {
      this.obtainedSecurityCodesByDoctor = data;
      if (this.obtainedSecurityCodesByDoctor.length > 0) {
        //this.obtainedSecurityCodesByDoctor.sort((a,b) => (new Date(a.expirationDate) > new Date(b.expirationDate)) ? 1 : ((new Date(b.expirationDate) > new Date(a.expirationDate)) ? -1 : 0))
        //console.log(this.obtainedSecurityCodesByDoctor[this.obtainedSecurityCodesByDoctor.length-1].expirationDate)
        this.obtainedSecurityCodesByDoctor.sort((a,b) => (new Date(a.expirationDate) < new Date(b.expirationDate)) ? 1 : ((new Date(b.expirationDate) < new Date(a.expirationDate)) ? -1 : 0))
        this.securityCode = this.obtainedSecurityCodesByDoctor[0]
        this.securityCodeNumber = this.obtainedSecurityCodesByDoctor[0].securityNumber
        this.securityCodeCreationDate = new Date(this.obtainedSecurityCodesByDoctor[0].expirationDate)
      }      
    });     
  }

  saveNewSecurityCode(){
    const today = new Date()
    const expirationDate = this.defineNewDate(today)
    const newSecurityCode = {
      id: Guid.create().toString(),
      securityNumber: (Math.floor(Math.random() * 999999)).toString(),
      //expirationDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 0),
      expirationDate: new Date(expirationDate.setDate(today.getDate() + 30)),
      doctorId: this.loggedDoctorId,
      creationDate: this.defineNewDate(new Date())
    }
    this.doctorService.addNewSecurityCode(newSecurityCode).subscribe(data => {      
      let createdSecurityCode : SecurityCodeI = data;
      this.doctorService.sendNotificationSecurityCodeById(createdSecurityCode.id!, this.loggedDoctorEmail).subscribe(data => {
        this.createAlertMessage("Código de seguridad generado con éxito", "success")
        this.getSecurityCodeByDoctorId()
      })
      this.securityCode = createdSecurityCode;
      this.securityCodeNumber = this.securityCode.securityNumber;
      this.securityCodeCreationDate = this.defineNewDate(new Date(this.securityCode.expirationDate))
      })            
  }

  defineNewDate(date : Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()))
  }
}
