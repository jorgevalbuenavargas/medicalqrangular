import { Component, OnInit } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { DoctorI } from 'src/app/models/doctor/doctor.interface';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class DoctorProfileComponent implements OnInit {

  loggedDoctorId = ''
  loggedProfile = ''
  loggedDoctorEmail = ''
  obtainedDoctor!: DoctorI;

  constructor(private doctorService : DoctorDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedDoctorId = this.appComponent.loggedId;
    this.loggedProfile = this.appComponent.profile;
    this.loggedDoctorEmail = this.appComponent.userEmail;
    this.getDoctorById()
  }

  getDoctorById() {
    this.doctorService.getDoctorById(this.loggedDoctorId).subscribe(data => {
      this.obtainedDoctor = data;
    })
  }
}
