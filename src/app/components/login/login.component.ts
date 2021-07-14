import { Component, OnInit, ViewChild } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import { AppComponent } from 'src/app/app.component';
import {Router} from "@angular/router";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DoctorDataService } from 'src/app/doctor-data.service';
import { AdminDataService } from 'src/app/admin-data.service';
import { PharmacyDataService } from 'src/app/pharmacy-data.service';
import { AdminI } from 'src/app/models/admin/admin.interface';
import { PharmacyI } from 'src/app/models/pharmacy/pharmacy.interface';
import { DoctorI } from 'src/app/models/doctor/doctor.interface';
import * as CryptoJS from 'crypto-js'; 
import {environment} from '../../../assets/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  selectedProfile = ''
  @ViewChild('alertContainer', { static: true }) 
  public titleContainer: any;
  public newAlertElement: any;
  private secretKey = environment.secretKey

  constructor(private doctorService : DoctorDataService, private adminService : AdminDataService, private pharmacyService : PharmacyDataService, private angularFireAuth : AngularFireAuth, public appComponent : AppComponent, private router: Router) { }

  registrationForm = new FormGroup({
    user: new FormControl(''),
  });

  ngOnInit(): void {
    this.angularFireAuth.signOut();
    this.appComponent.loggedId = '';
    this.appComponent.profile = '';
    this.appComponent.userEmail = '';
    this.selectedProfile = this.registrationForm.controls.user.value
    console.log(this.appComponent.loggedId)
    this.angularFireAuth.authState.subscribe(d => {
      this.angularFireAuth.signOut();
      console.log("Subscribe Auth " + this.selectedProfile)
      if (d !== null) {
        //this.selectedProfile = this.registrationForm.controls.user.value
        if (this.selectedProfile === 'Doctor'){
          console.log("Doctor " + this.selectedProfile)
          this.findDoctor(d!.uid)
        }else if (this.selectedProfile === 'Farmacia') {
          console.log("Farmacia " + this.selectedProfile)
          this.findPharmacy(d!.uid)
        }else if (this.selectedProfile === 'Admin') {
          console.log("Admin " + this.selectedProfile)
          this.findAdmin(d!.uid)
        } else {
          this.angularFireAuth.signOut();
          this.appComponent.loggedId = '';
          this.appComponent.profile = '';
          this.appComponent.userEmail = '';
          this.selectedProfile = ''
        }
      }          
    });
  }

  showForm(){
    if (this.registrationForm.controls.user.value != 'Seleccione...')
    {
      console.log(this.registrationForm.controls.user.value)
      this.selectedProfile = this.registrationForm.controls.user.value  
      /*this.angularFireAuth.authState.subscribe(d => {
        if (d !== null) {
          if (this.selectedProfile == 'Doctor'){
            this.findDoctor(d!.uid)
          }else if (this.selectedProfile == 'Farmacia') {
            this.findPharmacy(d!.uid)
          }else if (this.selectedProfile == 'Admin') {
            this.findAdmin(d!.uid)
          } else {
            this.angularFireAuth.signOut();
            this.appComponent.loggedId = '';
            this.appComponent.profile = '';
            this.appComponent.userEmail = '';
          }
        }          
      });*/
    } else {
      this.selectedProfile = ''
    }
  }

  findDoctor(providerId : string) {
    console.log("Find Doctor")
    this.doctorService.getDoctorByProvider(providerId).subscribe(doctorData => {
      let foundDoctors : DoctorI[] = doctorData;
      if (foundDoctors.length !== 0) {        
        if (foundDoctors[0].Status == 'Activo') {
          this.appComponent.loggedId = foundDoctors[0].id!,
          this.appComponent.profile = 'Doctor',
          this.appComponent.userEmail = foundDoctors[0].email
          this.router.navigate(['/securitycode'])
        }else {
          this.createAlertMessage("Su usuario se encuentra deshabilitado, si se registró por primera vez, su usuario será habilitado en un periodo máximo de 48 horas.", "warning")
          this.appComponent.loggedId = '';
          this.appComponent.profile = '';
          this.appComponent.userEmail = '';
          this.angularFireAuth.signOut();
        }
      } else {
        this.appComponent.loggedId = '';
        this.appComponent.profile = '';
        this.appComponent.userEmail = '';
        //console.log(CryptoJS.AES.encrypt(providerId, this.secretKey).toString());
        this.router.navigate(['/registration', CryptoJS.AES.encrypt(providerId, this.secretKey).toString()])        
      }
    })
  }

  findAdmin(providerId : string) {
    console.log("Find Admin")
    this.adminService.getAdminByProvider(providerId).subscribe(adminData => {
      let foundAdmins : AdminI[] = adminData;
      if (foundAdmins.length !== 0) {
        this.appComponent.loggedId = adminData[0].id!;
        this.appComponent.profile = 'Admin';
        this.appComponent.userEmail = adminData[0].email;
        this.router.navigate(['/adminDoctors'])
      }else {
        this.appComponent.loggedId = '';
        this.appComponent.profile = '';
        this.appComponent.userEmail = '';
        //this.router.navigate(['/registration', providerId])
        this.router.navigate(['/registration', CryptoJS.AES.encrypt(providerId, this.secretKey).toString()])        
      }  
    })
  }

  findPharmacy(providerId : string) {
    console.log("Find Farmacia")
    this.pharmacyService.getPharmacyByProvider(providerId).subscribe(pharmacyData => {
      let foundPharmacies : PharmacyI[] = pharmacyData;
      if (foundPharmacies.length !== 0) {
        if (foundPharmacies[0].Status == 'Activo') {
          this.appComponent.loggedId = foundPharmacies[0].id!;
          this.appComponent.profile = 'Farmacia';
          this.appComponent.userEmail = foundPharmacies[0].email;
          this.router.navigate(['/medicalPrescriptions'])  
        }else {
          this.createAlertMessage("Su usuario se encuentra deshabilitado, si se registró por primera vez, su usuario será habilitado en un periodo máximo de 48 horas.", "warning")
          this.appComponent.loggedId = '';
          this.appComponent.profile = '';
          this.appComponent.userEmail = '';
          this.angularFireAuth.signOut();
        }
      }else {
        this.appComponent.loggedId = '';
        this.appComponent.profile = '';
        this.appComponent.userEmail = '';
        //this.router.navigate(['/registration', providerId])
        this.router.navigate(['/registration', CryptoJS.AES.encrypt(providerId, this.secretKey).toString()])        
      } 
    })
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
      }, 5000);
  }

}
