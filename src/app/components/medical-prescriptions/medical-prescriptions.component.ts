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
    let oldestValidDate = new Date()
    oldestValidDate.setDate(oldestValidDate.getDate() - 15);
    let medicalPrescriptionDate = new Date(this.medicalPrescriptionForm.controls.expirationDate.value)  
    let typedSecurityCode  = this.medicalPrescriptionForm.controls.securityCode.value
    let typedUIC = this.medicalPrescriptionForm.controls.uic.value
    //let firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    if (medicalPrescriptionDate >= oldestValidDate){      
      this.doctorService.getUICById(typedUIC).subscribe(uicData => {
        let validMedicalPrescription = false;        
        this.doctorService.getAllSecurityCodesByDoctor(uicData.doctorId).subscribe(securityCodesData => {
          for (let securityCode of securityCodesData) {
            if (securityCode.securityNumber == typedSecurityCode) {
              //console.log("Código de seguridad encontrado")
              if (new Date(securityCode.expirationDate) >= medicalPrescriptionDate && new Date(securityCode.creationDate) <= medicalPrescriptionDate)  {
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
            let alertMessage = 'Alguno de los datos ingresados no es válido. La prescripción médica no es válida.'
            this.createAlertMessage(alertMessage, 'danger')
            this.saveNewMedicalReceipt("Fallido", this.appComponent.loggedId, typedUIC, typedSecurityCode, alertMessage)
          }
        })
      },
      error => {        
          //console.error('There was an error!', error);
          let alertMessage = 'El código QR no fue encontrado en el sistema. La prescripción médica no es válida.'
          this.saveNewMedicalReceipt("Fallido", this.appComponent.loggedId, typedUIC, typedSecurityCode, alertMessage)
          this.createAlertMessage(alertMessage, 'danger')
      })
    } else {
      let alertMessage = 'La fecha de la prescripción no se encuentra vigente. La prescripción médica no es válida.'
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
      scanDate: new Date(),
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

}
