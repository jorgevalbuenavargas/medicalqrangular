import { Component, OnInit } from '@angular/core';
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

  loggedProfile = '';
  obtainedDoctors: DoctorI[] = [];
  filteredobtainedDoctors: DoctorI[] = [];

  constructor(private doctorService : DoctorDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedProfile = this.appComponent.profile;
    this.getDoctors("Inactivo");

  }

  getDoctors(filteredStatus : string) {
    this.doctorService.getAllDoctors().subscribe(data => { 
      this.obtainedDoctors = data; 
      if (filteredStatus.length > 0) {
      this.filterByState(filteredStatus);
    } else {
      this.filteredobtainedDoctors = this.obtainedDoctors;
    }});
  }

  filterByState(selectedStatus: string) {
    this.filteredobtainedDoctors = this.obtainedDoctors.filter(doctor => doctor.Status == selectedStatus)
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

  onUpdateDoctor(receivedId: string, receivedStatus : string, receivedName : string, receivedLastName : string, receivedMedicalLicense : string, receivedEmail : string): void {
    const actualDoctor = {
      name : receivedName,
      lastName : receivedLastName,
      medicalLicense : receivedMedicalLicense,
      Status : receivedStatus,
      email : receivedEmail
    }
    this.doctorService.updateDoctor(actualDoctor, receivedId).subscribe(data => {
      this.getDoctors(receivedStatus);
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
    }) 
  }

  saveNewSecurityCode(filteredDoctorId : string){
    const newSecurityCode = { 
      id: Guid.create().toString(),
      securityNumber: (Math.floor(Math.random() * (999999 - 100000 + 1) + 100000).toString()),
      expirationDate: new Date(new Date().getFullYear(), new Date().getMonth()+2, 0),
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
          console.log(obtainedSecurityCodesByDoctor[obtainedSecurityCodesByDoctor.length-1].expirationDate)
          let securityCode : SecurityCodeI = obtainedSecurityCodesByDoctor[obtainedSecurityCodesByDoctor.length-1]
          this.doctorService.sendNotificationSecurityCodeById(securityCode.id!, doctor.email).subscribe(data => console.log(data)) 
        });  
      }
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
    })
  }

}

