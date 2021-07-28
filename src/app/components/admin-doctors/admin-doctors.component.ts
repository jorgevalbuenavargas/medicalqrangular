import { Component, OnInit, ViewChild } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { DoctorI } from '../../models/doctor/doctor.interface';
import { SecurityCodeI } from 'src/app/models/securitycode/securitycode.interface';
import { UniqueIdentifierCodeI } from 'src/app/models/uic/uic.interface';
import { AppComponent } from 'src/app/app.component';
import * as XLSX from 'xlsx'; 
import { Guid } from "guid-typescript"
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  @ViewChild('modalContainer', { static: true })
  public modalTitleContainer: any;
  public modalNewAlertElement: any;
  selectedDoctorId = '';
  doctorRegistrationForm = new FormGroup({
    doctorMedicalLicense: new FormControl(''),
  });
  validMedicalLicense = true;
  lastMonth = new Date().getFullYear() + "-" + this.getRealMonth(new Date(new Date().setMonth(new Date().getMonth() - 1)).getMonth()) + "-" + new Date().getDate()
  today = new Date().getFullYear() + "-" + this.getRealMonth(new Date().getMonth()) + "-" + new Date().getDate()

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
    this.loggedProfile = this.appComponent.profile;
    this.createAlertMessage("¡Bienvenido!", "success")
    //this.getDoctors();
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
    this.filteredobtainedDoctors = [];
    this.selectedStatus = '';
    this.doctorService.getAllDoctors().subscribe(data => { 
      this.obtainedDoctors = data; 
      const dateFrom = new Date(fromDate)
      const dateTo = new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1))
      dateTo.setSeconds(dateTo.getSeconds() - 1)
      for (let doctor of this.obtainedDoctors) {
        if (this.defineNewDate(new Date(doctor.creationDate)) >= dateFrom && this.defineNewDate(new Date(doctor.creationDate)) <= dateTo) { 
          this.filteredobtainedDoctors.push(doctor)
        }
      }
      if (this.filteredobtainedDoctors.length == 0) {
        this.createAlertMessage("No se encontraron resultados para el rango de fechas indicado.", "danger")
      }else {
        if (this.filtersForm.controls.state.value.length > 0){          
          if (this.filtersForm.controls.state.value == 'Activo' || this.filtersForm.controls.state.value == 'Inactivo' || this.filtersForm.controls.state.value == 'En evaluación') {
            this.filterDoctorByState(this.filtersForm.controls.state.value)
          }
        }
        if(this.filtersForm.controls.doctorMedicalLicense.value.length > 0) {
          this.filterByPharmacyData("medicalLicense", this.filtersForm.controls.doctorMedicalLicense.value )
        }
        if(this.filtersForm.controls.doctorLastName.value.length > 0) {
          this.filterByPharmacyData("lastName", this.filtersForm.controls.doctorLastName.value )
        }
        if(this.filtersForm.controls.doctorName.value.length > 0) {
          this.filterByPharmacyData("name", this.filtersForm.controls.doctorName.value )
        } 
      }
    });
  }

  filterDoctorByState(state : string) {
    let temporalfilteredobtainedDoctors = this.filteredobtainedDoctors
    this.filteredobtainedDoctors = [];
    for (let doctor of temporalfilteredobtainedDoctors) {
      if (doctor.Status == state) {
        this.filteredobtainedDoctors.push(doctor)
      }
    }
    if (this.filteredobtainedDoctors.length == 0) {
      this.createAlertMessage("No se encontraron resultados para el estado " + state + ".", "danger")
    }     
  }

  filterByPharmacyData(data: string, value : string) {
    let temporalfilteredobtainedDoctors = this.filteredobtainedDoctors
    this.filteredobtainedDoctors = [];
    for (let doctor of temporalfilteredobtainedDoctors) {
      if (data == 'medicalLicense') {
        if (doctor.medicalLicense == value) {
          this.filteredobtainedDoctors.push(doctor)
        }
      } else if (data == 'lastName'){
        if (doctor.lastName.trim().toUpperCase().includes(value.trim().toUpperCase())) {
          this.filteredobtainedDoctors.push(doctor)
        }
      } else {
        if (doctor.name.trim().toUpperCase().includes(value.trim().toUpperCase())) {
          this.filteredobtainedDoctors.push(doctor)
        }
      }      
    }
    if (this.filteredobtainedDoctors.length == 0) {
      this.createAlertMessage("No se encontraron resultados a partir de los datos ingresados.", "danger")
    }
  }

  /*submit(filterDates : any) {
    if (filterDates.form.controls.fromDate.value > filterDates.form.controls.toDate.value) {
      this.createAlertMessage("La fecha desde no puede ser superior a la fecha hasta.", "danger")
    } else {
      this.fromDate = filterDates.form.controls.fromDate.value;
      this.toDate = filterDates.form.controls.toDate.value
      this.filterByDates(this.fromDate, this.toDate)
    }
  }*/

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
  
  fileName= 'DoctorsExcelSheet.xlsx';  

  exportexcel(): void {  
    let element = document.getElementById('excel-table'); 
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, this.fileName);
        
  }

  onUpdateDoctor(receivedId: string, receivedStatus : string, receivedName : string, receivedLastName : string, receivedMedicalLicense : string, receivedEmail : string, receivedCreationDate : Date, receivedGmailID : string, receivedFacebookID : string): void {
    const actualDoctor = {
      name : receivedName,
      lastName : receivedLastName,
      medicalLicense : receivedMedicalLicense,
      Status : receivedStatus,
      email : receivedEmail,
      creationDate: receivedCreationDate,
      GmailID: receivedGmailID,
      FacebookID: receivedFacebookID
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
    const today = new Date()
    const expirationDate = this.defineNewDate(today)
    const newSecurityCode = { 
      id: Guid.create().toString(),
      securityNumber: (Math.floor(Math.random() * (999999 - 100000 + 1) + 100000).toString()),
      expirationDate: new Date(expirationDate.setDate(today.getDate() + 30)),
      doctorId: filteredDoctorId,
      creationDate: this.defineNewDate(today)
    }    
    this.doctorService.addNewSecurityCode(newSecurityCode).subscribe(securityCodeData => {
      let createdSecurityCode : SecurityCodeI = securityCodeData;
      //console.log(createdSecurityCode.id)
      this.doctorService.getDoctorById(filteredDoctorId).subscribe(doctorData => {
        let foundDoctor : DoctorI = doctorData;
        //console.log(foundDoctor.email)
        this.doctorService.sendNotificationSecurityCodeById(createdSecurityCode.id!, foundDoctor.email).subscribe(data => data) 
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
          this.doctorService.sendNotificationSecurityCodeById(securityCode.id!, doctor.email).subscribe(data => data) 
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
            this.doctorService.sendNotificationPendingUIC(doctor.id!, doctor.email).subscribe(data => data)
          }
        })
      }
      this.createAlertMessage("Proceso de notificación de CUI pendientes finalizado con éxito", "success")
    })
  }

  modalModifyMedicalLicense(doctorId: string){
    this.selectedDoctorId = doctorId;
  }

  modifyMedicalLicense(){    
    this.doctorService.getDoctorById(this.selectedDoctorId).subscribe(data => { 
      let obtainedDoctor : DoctorI = data; 
      this.onUpdateDoctor(obtainedDoctor.id!, obtainedDoctor.Status, obtainedDoctor.name, obtainedDoctor.lastName, this.doctorRegistrationForm.controls.doctorMedicalLicense.value, obtainedDoctor.email, obtainedDoctor.creationDate, obtainedDoctor.GmailID, obtainedDoctor.FacebookID)
    });
  }

  onMedicalLiceseChange(){
    if (this.doctorRegistrationForm.controls.doctorMedicalLicense.value.length >= 6) {
      this.validMedicalLicense = true
      this.doctorService.getAllDoctors().subscribe(doctorsData => {
        let allDoctors : DoctorI[] = doctorsData
        for (let doctor of allDoctors) {
          if (doctor.medicalLicense == this.doctorRegistrationForm.controls.doctorMedicalLicense.value){
            this.validMedicalLicense = false;
            break;
          }      
        }        
        if (!this.validMedicalLicense) {
          this.doctorRegistrationForm.controls.doctorMedicalLicense.setErrors({'incorrect': true});
        }
      })
    }    
  }

  defineNewDate(date : Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()))
  }

}

