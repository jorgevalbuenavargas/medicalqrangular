import { Component, OnInit } from '@angular/core';
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

  loggedDoctorId = ''
  loggedProfile = ''
  loggedDoctorEmail = ''
  securityCode = ''
  obtainedSecurityCodesByDoctor : SecurityCodeI[] = [];

  constructor(private doctorService : DoctorDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedDoctorId = this.appComponent.loggedId;
    this.loggedProfile = this.appComponent.profile;
    this.loggedDoctorEmail = this.appComponent.userEmail;
    this.getSecurityCodeByDoctorId();
  }

  getSecurityCodeByDoctorId() {
    this.doctorService.getAllSecurityCodesByDoctor(this.loggedDoctorId).subscribe(data => {
      this.obtainedSecurityCodesByDoctor = data;
      this.obtainedSecurityCodesByDoctor.sort((a,b) => (a.expirationDate > b.expirationDate) ? 1 : ((b.expirationDate > a.expirationDate) ? -1 : 0))
      console.log(this.obtainedSecurityCodesByDoctor[this.obtainedSecurityCodesByDoctor.length-1].expirationDate)
      this.securityCode = this.obtainedSecurityCodesByDoctor[this.obtainedSecurityCodesByDoctor.length-1].securityNumber
    });     
  }

  saveNewSecurityCode(){
    const newSecurityCode = {
      id: Guid.create().toString(),
      securityNumber: (Math.floor(Math.random() * 999999)).toString(),
      expirationDate: new Date(),
      doctorId: this.loggedDoctorId
    }
    this.doctorService.addNewSecurityCode(newSecurityCode).subscribe(data => {
      this.getSecurityCodeByDoctorId();
    });
  }


}
