import { Component, OnInit, ViewChild } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { DoctorI } from '../../models/doctor/doctor.interface';
import { SecurityCodeI } from 'src/app/models/securitycode/securitycode.interface';
import { UniqueIdentifierCodeI } from 'src/app/models/uic/uic.interface';
import { AppComponent } from 'src/app/app.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  foundUIC!: UniqueIdentifierCodeI;

  medicalPrescriptionForm = new FormGroup({
    uic: new FormControl(''),
    securityCode: new FormControl(''),
    expirationDate: new FormControl(''),
  });

  constructor(private doctorService : DoctorDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedProfile = this.appComponent.profile;
  }

  onSubmit() {
    let oldestValidDate = new Date()
    oldestValidDate.setDate(oldestValidDate.getDate() - 15);
    let medicalPrescriptionDate = new Date(this.medicalPrescriptionForm.controls.expirationDate.value)    
    //let firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    if (medicalPrescriptionDate >= oldestValidDate){      
      this.doctorService.getUICById(this.medicalPrescriptionForm.controls.uic.value).subscribe(uicData => {
        let validMedicalPrescription = false;
        this.doctorService.getAllSecurityCodesByDoctor(uicData.doctorId).subscribe(securityCodesData => {
          for (let securityCode of securityCodesData) {
            if (securityCode.securityNumber == this.medicalPrescriptionForm.controls.securityCode.value) {
              console.log("Código de seguridad encontrado")
              if (new Date(securityCode.expirationDate) >= medicalPrescriptionDate)  {
                validMedicalPrescription = true;
                break;
              }
            }        
          }
          if (validMedicalPrescription) {
            this.createAlertMessage('La prescripción médica es válida.', 'success')
          } else {
            this.createAlertMessage('Alguno de los datos ingresados no es válido. La prescripción médica no es válida.', 'danger')
          }
        })
      },
      error => {        
          //console.error('There was an error!', error);
          this.createAlertMessage('El código QR no fue encontrado en el sistema. La prescripción médica no es válida.', 'danger')
      })
    } else {
      this.createAlertMessage('La fecha de la prescripción no se encuentra vigente. La prescripción médica no es válida.', 'danger')
    }
    this.medicalPrescriptionForm.patchValue({
      uic: '',
      securityCode: '',
      expirationDate: ''
    });
    this.medicalPrescriptionForm.reset()
  }

  createAlertMessage(alertMessage : string, alertType : string){
    this.newAlertElement = document.createElement("div");
    this.newAlertElement.innerHTML = '<div class="alert alert-'+alertType+' alert-dismissible fade show" role="alert">' + 
    alertMessage + 
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    this.titleContainer.nativeElement.appendChild(this.newAlertElement);
  }

}
