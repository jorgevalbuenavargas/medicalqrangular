import { Component, OnInit, ViewChild } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { SecurityCodeI } from '../../models/securitycode/securitycode.interface';
import { AppComponent } from 'src/app/app.component';
import { Guid } from "guid-typescript"

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

  constructor(private doctorService : DoctorDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedDoctorId = this.appComponent.loggedId;
    this.loggedProfile = this.appComponent.profile;
    this.loggedDoctorEmail = this.appComponent.userEmail;
    this.getSecurityCodeByDoctorId();
  }

  createAlertMessage(alertMessage : string){
    this.newAlertElement = document.createElement("div");
    this.newAlertElement.innerHTML = '<div class="alert alert-success alert-dismissible fade show" role="alert">' + 
    alertMessage + 
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    this.titleContainer.nativeElement.appendChild(this.newAlertElement);
  }

  getSecurityCodeByDoctorId() {
    this.doctorService.getAllSecurityCodesByDoctor(this.loggedDoctorId).subscribe(data => {
      this.obtainedSecurityCodesByDoctor = data;
      if (this.obtainedSecurityCodesByDoctor.length > 0) {
        this.obtainedSecurityCodesByDoctor.sort((a,b) => (a.expirationDate > b.expirationDate) ? 1 : ((b.expirationDate > a.expirationDate) ? -1 : 0))
        //console.log(this.obtainedSecurityCodesByDoctor[this.obtainedSecurityCodesByDoctor.length-1].expirationDate)
        this.securityCode = this.obtainedSecurityCodesByDoctor[this.obtainedSecurityCodesByDoctor.length-1]
        this.securityCodeNumber = this.obtainedSecurityCodesByDoctor[this.obtainedSecurityCodesByDoctor.length-1].securityNumber
        this.securityCodeCreationDate = this.obtainedSecurityCodesByDoctor[this.obtainedSecurityCodesByDoctor.length-1].expirationDate 
      }      
    });     
  }

  saveNewSecurityCode(){
    const newSecurityCode = {
      id: Guid.create().toString(),
      securityNumber: (Math.floor(Math.random() * 999999)).toString(),
      expirationDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 0),
      doctorId: this.loggedDoctorId
    }
    this.doctorService.addNewSecurityCode(newSecurityCode).subscribe(data => {      
      let createdSecurityCode : SecurityCodeI = data;
      this.doctorService.sendNotificationSecurityCodeById(createdSecurityCode.id!, this.loggedDoctorEmail).subscribe(data => {
        this.createAlertMessage("Código de seguridad generado con éxito")})
        if (this.securityCode != null) {
          this.securityCode.expirationDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          this.doctorService.updateSecurityCode(this.securityCode, this.securityCode.id!).subscribe(modifiedSecurityCodeData => {
            this.securityCode = data;                
          })        
        }
      this.securityCode = createdSecurityCode;
      this.securityCodeNumber = this.securityCode.securityNumber;
      })            
  }
}
