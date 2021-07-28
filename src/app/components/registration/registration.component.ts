import { Component, OnInit, ViewChild } from '@angular/core';
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
import {Router, ActivatedRoute} from "@angular/router"
import {AngularFireAuth} from '@angular/fire/auth';
import * as CryptoJS from 'crypto-js'; 
import {environment} from '../../../assets/environments/environment';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  loggedProfile = '';
  selectedProfile = '';
  gmailId = ''
  validMedicalLicense = true;
  validCUIT = true;
  @ViewChild('alertContainer', { static: true }) 
  public titleContainer: any;
  public newAlertElement: any;
  private secretKey = environment.secretKey
  

  constructor(private angularFireAuth : AngularFireAuth, private adminService : AdminDataService, private doctorService : DoctorDataService, private appComponent : AppComponent, private pharmacyService : PharmacyDataService, private router: Router, private route: ActivatedRoute) { }

  registrationForm = new FormGroup({
    user: new FormControl(''),
  });

  doctorRegistrationForm = new FormGroup({
    doctorName: new FormControl({value: '', disabled: true}, Validators.required),
    doctorLastName: new FormControl({value: '', disabled: true}, Validators.required),
    doctorEmail: new FormControl({value: '', disabled: true}, [ Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
    doctorMedicalLicense: new FormControl(''),
  });

  pharmacyRegistrationForm = new FormGroup({
    companyName: new FormControl({value: '', disabled: true}, Validators.required),
    businessName: new FormControl({value: '', disabled: true}, Validators.required),
    pharmacyEmail: new FormControl({value: '', disabled: true}, [ Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
    pharmacyCUIT: new FormControl({value: '', disabled: false}, [ Validators.pattern("^[0-9]*$")]),
  });

  adminRegistrationForm = new FormGroup({
    adminName: new FormControl(''),
    adminLastName: new FormControl(''),
    adminEmail: new FormControl('', [ Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
  });


  ngOnInit(): void {
    this.gmailId = this.route.snapshot.paramMap.get('id')!
    this.gmailId = CryptoJS.AES.decrypt(this.gmailId, this.secretKey).toString(CryptoJS.enc.Utf8)
    if (this.gmailId == ''){
      this.router.navigate(['/login'])
    }    
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
          this.doctorRegistrationForm.controls.doctorEmail.enable()
        } else {
          this.doctorRegistrationForm.controls.doctorMedicalLicense.setErrors({'incorrect': true});
          this.doctorRegistrationForm.controls.doctorName.disable()
          this.doctorRegistrationForm.controls.doctorLastName.disable()
          this.doctorRegistrationForm.controls.doctorEmail.disable()
        }
      })
    }    
  }

  onCUITChange(){    
    if (this.pharmacyRegistrationForm.controls.pharmacyCUIT.value.length >= 11) {
      let principio = this.pharmacyRegistrationForm.controls.pharmacyCUIT.value[0] + this.pharmacyRegistrationForm.controls.pharmacyCUIT.value[1]      
      this.validCUIT = true;
      if (principio == '30') {
        if (this.calculateCUIT(this.pharmacyRegistrationForm.controls.pharmacyCUIT.value)) {
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
              this.pharmacyRegistrationForm.controls.pharmacyEmail.enable()
            } else {
              this.validCUIT = false;
              this.pharmacyRegistrationForm.controls.pharmacyCUIT.setErrors({'incorrect': true});
              this.pharmacyRegistrationForm.controls.companyName.disable()
              this.pharmacyRegistrationForm.controls.businessName.disable()
              this.pharmacyRegistrationForm.controls.pharmacyEmail.disable()
            }
          })
        }  else {
          this.validCUIT = false;
          this.pharmacyRegistrationForm.controls.pharmacyCUIT.setErrors({'incorrect': true});
          this.pharmacyRegistrationForm.controls.companyName.disable()
          this.pharmacyRegistrationForm.controls.businessName.disable()
          this.pharmacyRegistrationForm.controls.pharmacyEmail.disable()
        }      
      } else {
        this.validCUIT = false;
        this.pharmacyRegistrationForm.controls.pharmacyCUIT.setErrors({'incorrect': true});
        this.pharmacyRegistrationForm.controls.companyName.disable()
        this.pharmacyRegistrationForm.controls.businessName.disable()
        this.pharmacyRegistrationForm.controls.pharmacyEmail.disable()
      }   
      
    }    
  }

  calculateCUIT(cuit : string){
    //let cuit = "30710316097"
    let base = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
    let aux = 0
    let validDigit = 0
    for (let i = 0; i < base.length; i++) {
      aux += parseInt(cuit[i]) * base[i]
    }    
    if ((aux % 11) == 0){  
      validDigit = 0    
    } else {
      validDigit = (11 - Math.round((aux % 11)))
    }
    if (validDigit == parseInt(cuit[10])){
      return true
    } else {
      return false
    }
  }

  onSubmit(){
    const newDoctor = {
      id: Guid.create().toString(),
      name: this.doctorRegistrationForm.controls.doctorName.value,
      lastName: this.doctorRegistrationForm.controls.doctorLastName.value,
      medicalLicense: this.doctorRegistrationForm.controls.doctorMedicalLicense.value,
      Status: 'En evaluación',
      email: this.doctorRegistrationForm.controls.doctorEmail.value,
      creationDate: this.defineNewDate(new Date()),
      GmailID: this.gmailId,
      FacebookID: '',
    }
    this.doctorService.addNewDoctor(newDoctor).subscribe(data => {
      /*this.loggedProfile = 'Doctor',
      this.appComponent.profile = this.loggedProfile
      this.appComponent.loggedId = newDoctor.id
      this.appComponent.userEmail = newDoctor.email*/
      this.saveNewSecurityCode(newDoctor.id, newDoctor.email)
    })
  }

  saveNewSecurityCode(receivedDoctorId : string, receivedDoctorEmail : string){
    const newSecurityCode = {
      id: Guid.create().toString(),
      securityNumber: (Math.floor(Math.random() * 999999)).toString(),
      expirationDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 0),
      doctorId: receivedDoctorId,
      creationDate: this.defineNewDate(new Date())
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
      creationDate: this.defineNewDate(new Date()),
      doctorId: receivedDoctorId,
      modificationDate: this.defineNewDate(new Date())
    }
    this.doctorService.addNewUIC(newUIC).subscribe(data => {
      //console.log("Done")
      this.createAlertMessage("Su usuario ha sido creado con éxito, en un periodo máximo de 48 horas validaremos su licencia médica y habilitaremos su acceso a la aplicación. En breve será redireccionado al Inicio de sesión.", "success")      
      this.selectedProfile = ''
      setTimeout( () => { 
        this.angularFireAuth.signOut();
        this.router.navigate(['/login'])
        }, 1000);      
    });    
  }


  onPharmacySubmit(){
    const newPharmacy = {
      id: Guid.create().toString(),
      company_name: this.pharmacyRegistrationForm.controls.companyName.value,
      business_name: this.pharmacyRegistrationForm.controls.businessName.value,
      cuit: this.pharmacyRegistrationForm.controls.pharmacyCUIT.value,
      Status: 'Activo',
      email: this.pharmacyRegistrationForm.controls.pharmacyEmail.value,
      creationDate: this.defineNewDate(new Date()),
      GmailID: this.gmailId,
      FacebookID: '',
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
      name: this.adminRegistrationForm.controls.adminName.value,
      lastName: this.adminRegistrationForm.controls.adminLastName.value,
      email: this.adminRegistrationForm.controls.adminEmail.value,
      GmailID: this.gmailId,
      FacebookID: '',
    }
    this.adminService.addNewAdmin(newAdmin).subscribe(data => {
      this.loggedProfile = 'Admin',
      this.appComponent.profile = this.loggedProfile
      this.appComponent.loggedId = newAdmin.id
      this.appComponent.userEmail = newAdmin.email
      this.router.navigate(['/adminDoctors'])
    })
  }
  
  showForm(){
    this.selectedProfile = this.registrationForm.controls.user.value
    //console.log(this.gmailId)
    //console.log(this.selectedProfile)
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
      closeButton.click();
      }, 10000);
  }

  defineNewDate(date : Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()))
  }

}
