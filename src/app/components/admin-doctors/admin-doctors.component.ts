import { Component, OnInit, ViewChild } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { DoctorI } from '../../models/doctor/doctor.interface';
import { SecurityCodeI } from 'src/app/models/securitycode/securitycode.interface';
import { UniqueIdentifierCodeI } from 'src/app/models/uic/uic.interface';
import { AppComponent } from 'src/app/app.component';
import * as XLSX from 'xlsx'; 
import { Guid } from "guid-typescript"

@Component({
  selector: 'app-admin-doctors',
  templateUrl: './admin-doctors.component.html',
  styleUrls: ['./admin-doctors.component.css']
})
export class AdminDoctorsComponent implements OnInit {

  @ViewChild('alertContainer', { static: true }) 
  public titleContainer: any;
  public newAlertElement: any;
  loggedProfile = '';
  obtainedDoctors: DoctorI[] = [];
  filteredobtainedDoctors: DoctorI[] = [];
  fromDate: any;
  toDate: any;
  selectedStatus = '';

  constructor(private doctorService : DoctorDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedProfile = this.appComponent.profile;
    //this.getDoctors();
  }

  submit(filterDates : any) {
    if (filterDates.form.controls.fromDate.value > filterDates.form.controls.toDate.value) {
      this.createAlertMessage("La fecha desde no puede ser superior a la fecha hasta.", "danger")
    } else {
      this.fromDate = filterDates.form.controls.fromDate.value;
      this.toDate = filterDates.form.controls.toDate.value
      this.filterByDates(this.fromDate, this.toDate)
    }
  }

  createAlertMessage(alertMessage : string, alertType : string){
    this.newAlertElement = document.createElement("div");
    this.newAlertElement.innerHTML = '<div class="alert alert-'+alertType+' alert-dismissible fade show" role="alert">' + 
    alertMessage + 
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    this.titleContainer.nativeElement.appendChild(this.newAlertElement);
  }

  getDoctors() {
    this.doctorService.getAllDoctors().subscribe(data => { 
      this.obtainedDoctors = data; 
    });
  }

  getFilteredDoctors(filteredStatus : string) {
    this.filteredobtainedDoctors = [];
    this.selectedStatus = filteredStatus;
    this.doctorService.getAllDoctors().subscribe(data => { 
      this.obtainedDoctors = data; 
      this.filterByState(filteredStatus);
      if(this.filteredobtainedDoctors.length == 0) {
        this.createAlertMessage("No se encontraron resultados para el estado " + filteredStatus + ".", "danger")
      }
    });
  }

  filterByState(selectedStatus: string) {
    this.filteredobtainedDoctors = this.obtainedDoctors.filter(doctor => doctor.Status == selectedStatus)
  }

  filterByDates(fromDate: string, toDate: string) {
    this.filteredobtainedDoctors = [];
    this.selectedStatus = '';
    this.doctorService.getAllDoctors().subscribe(data => { 
      this.obtainedDoctors = data; 
      for (let doctor of this.obtainedDoctors) {
        if (new Date(doctor.creationDate) >= new Date(fromDate) && new Date(doctor.creationDate) <= new Date(toDate)) {
          this.filteredobtainedDoctors.push(doctor)
        }
      }
      if (this.filteredobtainedDoctors.length == 0) {
        this.createAlertMessage("No se encontraron resultados para el rango de fechas indicado.", "danger")
      }
    });
  }
  
  /*name of the excel-file which will be downloaded. */ 
  fileName= 'DoctorsExcelSheet.xlsx';  

  exportexcel(): void {
    /* table id is passed over here */   
    let element = document.getElementById('excel-table'); 
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
        
  }

  onUpdateDoctor(receivedId: string, receivedStatus : string, receivedName : string, receivedLastName : string, receivedMedicalLicense : string, receivedEmail : string, receivedCreationDate : Date): void {
    const actualDoctor = {
      name : receivedName,
      lastName : receivedLastName,
      medicalLicense : receivedMedicalLicense,
      Status : receivedStatus,
      email : receivedEmail,
      creationDate: receivedCreationDate
    }
    this.doctorService.updateDoctor(actualDoctor, receivedId).subscribe(data => {
      //this.getDoctors(receivedStatus);
      if (this.selectedStatus.length == 0){
        this.filterByDates(this.fromDate, this.toDate)
      }else {
        this.getFilteredDoctors(this.selectedStatus)
      }
      this.createAlertMessage("Doctor modificado con éxito", "success")
    })
  }

  createMassiveSecurityCodes() {
    this.doctorService.getAllDoctors().subscribe(data => { 
      let massiveObtainedDoctors : DoctorI[] = data; 
      let massiveFilteredobtainedDoctors : DoctorI[] = massiveObtainedDoctors.filter(doctor => doctor.Status == "Activo")
      for (let doctor of massiveFilteredobtainedDoctors) {
        let doctorId : string = doctor.id!;
        this.saveNewSecurityCode(doctorId)
      }
      this.createAlertMessage("Proceso de creación de Códigos de seguridad finalizado con éxito", "success")
    }) 
  }

  saveNewSecurityCode(filteredDoctorId : string){
    const newSecurityCode = { 
      id: Guid.create().toString(),
      securityNumber: (Math.floor(Math.random() * (999999 - 100000 + 1) + 100000).toString()),
      expirationDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 0),
      doctorId: filteredDoctorId
    }   
    this.doctorService.addNewSecurityCode(newSecurityCode).subscribe(securityCodeData => {
      let createdSecurityCode : SecurityCodeI = securityCodeData;
      //console.log(createdSecurityCode.id)
      this.doctorService.getDoctorById(filteredDoctorId).subscribe(doctorData => {
        let foundDoctor : DoctorI = doctorData;
        //console.log(foundDoctor.email)
        this.doctorService.sendNotificationSecurityCodeById(createdSecurityCode.id!, foundDoctor.email).subscribe(data => console.log(data)) 
      })
    })
  }

  notificateMassiveSecurityCodes(){
    this.doctorService.getAllDoctors().subscribe(doctorsData => {
      let foundDoctors : DoctorI[] = doctorsData;
      for (let doctor of foundDoctors) {
        this.doctorService.getAllSecurityCodesByDoctor(doctor.id!).subscribe(data => {
          let obtainedSecurityCodesByDoctor : SecurityCodeI[] = data;
          obtainedSecurityCodesByDoctor.sort((a,b) => (a.expirationDate > b.expirationDate) ? 1 : ((b.expirationDate > a.expirationDate) ? -1 : 0))
          //console.log(obtainedSecurityCodesByDoctor[obtainedSecurityCodesByDoctor.length-1].expirationDate)
          let securityCode : SecurityCodeI = obtainedSecurityCodesByDoctor[obtainedSecurityCodesByDoctor.length-1]
          this.doctorService.sendNotificationSecurityCodeById(securityCode.id!, doctor.email).subscribe(data => console.log(data)) 
        });  
      }
      this.createAlertMessage("Proceso de notificación de Códigos de seguridad finalizado con éxito", "success")
    })
  }

  notificatePendingUICByDoctor() {
    this.doctorService.getAllDoctors().subscribe(doctorsData => {
      let foundDoctors : DoctorI[] = doctorsData;
      let filteredobtainedDoctors : DoctorI[] = foundDoctors.filter(doctor => doctor.Status == 'Activo')
      for (let doctor of filteredobtainedDoctors) {
        this.doctorService.getAllUICByDoctor(doctor.id!).subscribe(data => {
          let obtainedUniqueIdentifierCodesByDoctor : UniqueIdentifierCodeI[] = data;
          let filteredUniqueIdentifierCodesByDoctor : UniqueIdentifierCodeI[] = obtainedUniqueIdentifierCodesByDoctor.filter(uniquecode => uniquecode.status == 'Pendiente')
          if (filteredUniqueIdentifierCodesByDoctor.length > 0) {
            this.doctorService.sendNotificationPendingUIC(doctor.id!, doctor.email).subscribe(data => console.log(data))
          }
        })
      }
      this.createAlertMessage("Proceso de notificación de CUI pendientes finalizado con éxito", "success")
    })
  }

}

