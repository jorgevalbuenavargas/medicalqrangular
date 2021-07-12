import { Component, OnInit } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { PharmacyDataService } from 'src/app/pharmacy-data.service';
import { AdminDataService } from 'src/app/admin-data.service';
import { DoctorI } from '../../models/doctor/doctor.interface';
import { AppComponent } from 'src/app/app.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PharmacyI } from 'src/app/models/pharmacy/pharmacy.interface';
import { Guid } from "guid-typescript"
import { SecurityCodeI } from 'src/app/models/securitycode/securitycode.interface';
import { AdminI } from 'src/app/models/admin/admin.interface';
import {Router} from "@angular/router"

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  loggedProfile = '';
  selectedProfile = '';
  validMedicalLicense = true;
  validCUIT = true;

  constructor(private adminService : AdminDataService, private doctorService : DoctorDataService, private appComponent : AppComponent, private pharmacyService : PharmacyDataService, private router: Router) { }

  registrationForm = new FormGroup({
    user: new FormControl(''),
  });

  doctorRegistrationForm = new FormGroup({
    doctorName: new FormControl({value: '', disabled: true}, Validators.required),
    doctorLastName: new FormControl({value: '', disabled: true}, Validators.required),
    doctorMedicalLicense: new FormControl(''),
  });

  pharmacyRegistrationForm = new FormGroup({
    companyName: new FormControl({value: '', disabled: true}, Validators.required),
    businessName: new FormControl({value: '', disabled: true}, Validators.required),
    pharmacyCUIT: new FormControl(''),
  });

  adminRegistrationForm = new FormGroup({
    adminName: new FormControl(''),
    adminLastName: new FormControl(''),
  });


  ngOnInit(): void {
    this.loggedProfile = this.appComponent.profile;
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
        if (this.validMedicalLicense) {
          this.doctorRegistrationForm.controls.doctorName.enable()
          this.doctorRegistrationForm.controls.doctorLastName.enable()
        } else {
          this.doctorRegistrationForm.controls.doctorMedicalLicense.setErrors({'incorrect': true});
          this.doctorRegistrationForm.controls.doctorName.disable()
          this.doctorRegistrationForm.controls.doctorLastName.disable()
        }
      })
    }    
  }

  onCUITChange(){
    if (this.pharmacyRegistrationForm.controls.pharmacyCUIT.value.length >= 11) {
      this.validCUIT = true
      this.pharmacyService.getAllPharmacies().subscribe(pharmaciesData => {
        let allPharmacies : PharmacyI[] = pharmaciesData
        for (let pharmacy of allPharmacies) {
          if (pharmacy.cuit == this.pharmacyRegistrationForm.controls.pharmacyCUIT.value){
            this.validCUIT = false;
            break;
          }      
        }        
        if (this.validCUIT) {
          this.pharmacyRegistrationForm.controls.companyName.enable()
          this.pharmacyRegistrationForm.controls.businessName.enable()
        } else {
          this.pharmacyRegistrationForm.controls.pharmacyCUIT.setErrors({'incorrect': true});
          this.pharmacyRegistrationForm.controls.companyName.disable()
          this.pharmacyRegistrationForm.controls.businessName.disable()
        }
      })
    }    
  }

  onSubmit(){
    const newDoctor = {
      id: Guid.create().toString(),
      name: this.doctorRegistrationForm.controls.doctorName.value,
      lastName: this.doctorRegistrationForm.controls.doctorLastName.value,
      medicalLicense: this.doctorRegistrationForm.controls.doctorMedicalLicense.value,
      Status: 'En evaluación',
      email: 'jorge.valbuenavargas@davinci.edu.ar',
      creationDate: new Date(),
      GmailID: Guid.create().toString(),
      FacebookID: Guid.create().toString(),
    }
    this.doctorService.addNewDoctor(newDoctor).subscribe(data => {
      this.loggedProfile = 'Doctor',
      this.appComponent.profile = this.loggedProfile
      this.appComponent.loggedId = newDoctor.id
      this.appComponent.userEmail = newDoctor.email
      this.saveNewSecurityCode(newDoctor.id, newDoctor.email)
    })
  }

  saveNewSecurityCode(receivedDoctorId : string, receivedDoctorEmail : string){
    const newSecurityCode = {
      id: Guid.create().toString(),
      securityNumber: (Math.floor(Math.random() * 999999)).toString(),
      expirationDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 0),
      doctorId: receivedDoctorId,
      creationDate: new Date()
    }
    this.doctorService.addNewSecurityCode(newSecurityCode).subscribe(data => {      
      let createdSecurityCode : SecurityCodeI = data;
      this.doctorService.sendNotificationSecurityCodeById(createdSecurityCode.id!, receivedDoctorEmail).subscribe(data => {
        this.saveNewUIC(receivedDoctorId)
        })        
      })            
  }


  saveNewUIC(receivedDoctorId : string){
    const newUIC = {
      id: Guid.create().toString(),
      status: "Pendiente",
      creationDate: new Date(),
      doctorId: receivedDoctorId,
      modificationDate: new Date()
    }
    this.doctorService.addNewUIC(newUIC).subscribe(data => {
      //console.log("Done")
      this.router.navigate(['/securitycode'])
    });    
  }


  onPharmacySubmit(){
    const newPharmacy = {
      id: Guid.create().toString(),
      company_name: this.pharmacyRegistrationForm.controls.companyName.value,
      business_name: this.pharmacyRegistrationForm.controls.businessName.value,
      cuit: this.pharmacyRegistrationForm.controls.pharmacyCUIT.value,
      Status: 'Activo',
      email: 'jorge.valbuenavargas@davinci.edu.ar',
      creationDate: new Date(),
      GmailID: Guid.create().toString(),
      FacebookID: Guid.create().toString(),
    }
    this.pharmacyService.addNewPharmacy(newPharmacy).subscribe(data => {
      this.loggedProfile = 'Farmacia',
      this.appComponent.profile = this.loggedProfile
      this.appComponent.loggedId = newPharmacy.id
      this.appComponent.userEmail = newPharmacy.email 
      this.router.navigate(['/medicalPrescriptions'])     
    })
  }

  onAdminSubmit(){
    const newAdmin = {
      id: Guid.create().toString(),
      name: this.adminRegistrationForm.controls.doctorName.value,
      lastName: this.adminRegistrationForm.controls.doctorLastName.value,
      email: 'jorge.valbuenavargas@davinci.edu.ar',
      GmailID: Guid.create().toString(),
      FacebookID: Guid.create().toString(),
    }
    this.adminService.addNewAdmin(newAdmin).subscribe(data => {
      this.loggedProfile = 'Admin',
      this.appComponent.profile = this.loggedProfile
      this.appComponent.loggedId = newAdmin.id
      this.appComponent.userEmail = newAdmin.email
      this.router.navigate(['/adminPrescriptions'])
    })
  }
  
  showForm(){
    this.selectedProfile = this.registrationForm.controls.user.value
    //console.log(this.selectedProfile)
  }

}
