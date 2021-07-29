import { Component, OnInit, ViewChild } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { PharmacyDataService } from 'src/app/pharmacy-data.service';
import { DoctorI } from '../../models/doctor/doctor.interface';
import { MedicalReceiptI } from 'src/app/models/medicalReceipts/medicalReceipt.interface';
import { Guid } from "guid-typescript"
import { SecurityCodeI } from 'src/app/models/securitycode/securitycode.interface';
import { UniqueIdentifierCodeI } from 'src/app/models/uic/uic.interface';
import { AppComponent } from 'src/app/app.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PharmacyI } from 'src/app/models/pharmacy/pharmacy.interface';
import * as moment from 'moment';

@Component({
  selector: 'app-medical-prescriptions',
  templateUrl: './medical-prescriptions.component.html',
  styleUrls: ['./medical-prescriptions.component.css']
})
export class MedicalPrescriptionsComponent implements OnInit {
  
  @ViewChild('alertContainer', { static: true }) 
  public titleContainer: any;
  public newAlertElement: any;
  loggedProfile = '';
  doctorName = '';
  doctorMedicalLicense = '';
  foundUIC!: UniqueIdentifierCodeI;
  @ViewChild('closeButton', { static: true }) selfClosingAlert : any;
  

  medicalPrescriptionForm = new FormGroup({
    uic: new FormControl(''),
    securityCode: new FormControl(''),
    expirationDate: new FormControl(''),
  });

  constructor(private doctorService : DoctorDataService, private appComponent : AppComponent, private pharmacyService : PharmacyDataService) { }

  ngOnInit(): void {
    this.loggedProfile = this.appComponent.profile;
    this.createAlertMessage("¡Bienvenido!", "success")
  }

  onChange(){
    let typedUIC = this.medicalPrescriptionForm.controls.uic.value
    this.doctorService.getUICById(typedUIC).subscribe(uicData => {
      this.doctorService.getDoctorById(uicData.doctorId).subscribe(doctorData => {
        this.doctorName = doctorData.name + " " + doctorData.lastName;
        this.doctorMedicalLicense = doctorData.medicalLicense
      }, error => {        
        //console.error('There was an error!', error);
        this.doctorName = 'No encontrado';
        this.doctorMedicalLicense = 'No encontrada';
      })
    }, error => {        
      //console.error('There was an error!', error);
      this.doctorName = 'No encontrado';
      this.doctorMedicalLicense = 'No encontrada';
    })
  }

  onSubmit() {
    var month = new Array();
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
    let oldestValidDate = new Date(new Date().getFullYear() + "-" + month[new Date().getMonth()] + "-" + new Date().getDate())
    oldestValidDate.setDate(oldestValidDate.getDate() - 30);
    let medicalPrescriptionDate = new Date(this.medicalPrescriptionForm.controls.expirationDate.value)  
    medicalPrescriptionDate.setDate(medicalPrescriptionDate.getDate() + 1)
    medicalPrescriptionDate.setSeconds(medicalPrescriptionDate.getSeconds() - 1)
    let typedSecurityCode  = this.medicalPrescriptionForm.controls.securityCode.value
    let typedUIC = this.medicalPrescriptionForm.controls.uic.value      
    if (medicalPrescriptionDate >= oldestValidDate){      
      this.doctorService.getUICById(typedUIC).subscribe(uicData => {
        if(uicData.status == 'Activo' || medicalPrescriptionDate < new Date(uicData.modificationDate)){
          let validMedicalPrescription = false;        
          let foundMedicalPrescription = false;
          this.doctorService.getAllSecurityCodesByDoctor(uicData.doctorId).subscribe(securityCodesData => {
            for (let securityCode of securityCodesData) {
              if (securityCode.securityNumber == typedSecurityCode) {
                foundMedicalPrescription = true;
                let securityCodeExpirationDate = this.defineNewDate(new Date(securityCode.expirationDate))
                securityCodeExpirationDate.setDate(securityCodeExpirationDate.getDate() + 1)
                securityCodeExpirationDate.setSeconds(securityCodeExpirationDate.getSeconds() - 1)
                let securityCodeCreationDate = this.defineNewDate(new Date(securityCode.creationDate))
                if (securityCodeExpirationDate >= medicalPrescriptionDate && securityCodeCreationDate <= medicalPrescriptionDate)  {
                  validMedicalPrescription = true;
                  break;
                }
              }        
            }
            if (validMedicalPrescription) {
              let alertMessage = 'La prescripción médica es válida.'
              this.createAlertMessage(alertMessage, 'success')
              this.saveNewMedicalReceipt("Exitoso", this.appComponent.loggedId, typedUIC, typedSecurityCode, alertMessage)
            } else {
              let alertMessage = ""
              if (foundMedicalPrescription){
                alertMessage = 'El código de seguridad no se encuentra vigente. La prescripción médica no es válida.'  
              } else {
                alertMessage = 'El código de seguridad no fue encontrado. La prescripción médica no es válida.'   
              }              
              this.createAlertMessage(alertMessage, 'danger')
              this.saveNewMedicalReceipt("Fallido", this.appComponent.loggedId, typedUIC, typedSecurityCode, alertMessage)
            }
          })
        }  else {         
          let alertMessage = 'El código QR no se encuentra habilitado o fue deshabilitado antes de la fecha de generación de la prescripción médica. La prescripción médica no es válida.'
          this.createAlertMessage(alertMessage, 'danger')
          this.saveNewMedicalReceipt("Fallido", this.appComponent.loggedId, typedUIC, typedSecurityCode, alertMessage)
        }      
      },
      error => {        
          //console.error('There was an error!', error);
          let alertMessage = 'El código QR no fue encontrado en el sistema. La prescripción médica no es válida.'
          this.saveNewMedicalReceipt("Fallido", this.appComponent.loggedId, typedUIC, typedSecurityCode, alertMessage)
          this.createAlertMessage(alertMessage, 'danger')
      })
    } else {
      let alertMessage = 'La fecha de la prescripción es inferior a 30 días y no se encuentra vigente. La prescripción médica no es válida.'
      this.saveNewMedicalReceipt("Fallido", this.appComponent.loggedId, typedUIC, typedSecurityCode, alertMessage)
      this.createAlertMessage(alertMessage, 'danger')
    }
    this.medicalPrescriptionForm.patchValue({
      uic: '',
      securityCode: '',
      expirationDate: ''
    });
    this.medicalPrescriptionForm.reset();
    this.doctorMedicalLicense = '';
    this.doctorName = ''
    
  }




  createAlertMessage(alertMessage : string, alertType : string){
    this.newAlertElement = document.createElement("div");
    this.newAlertElement.innerHTML = '<div class="alert alert-'+alertType+' alert-dismissible fade show" role="alert" data-auto-dismiss="2000">' + 
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

  saveNewMedicalReceipt(result : string, pharmacy : string, uic : string, securityCode : string, message : string){
    const newMedicalReceipt = {
      id: Guid.create().toString(),
      scanDate: this.defineNewDate(new Date()),
      validationResult: result,
      pharmacyId: pharmacy,
      uicId: uic,
      securityCodeId: securityCode,
      applicationMessage: message      
    }
    this.pharmacyService.addNewMedicalReceipt(newMedicalReceipt).subscribe(data => {      
      let createdMedicalReceipt : MedicalReceiptI = data;
    })
  }

  defineNewDate(date : Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()))
  }

}
