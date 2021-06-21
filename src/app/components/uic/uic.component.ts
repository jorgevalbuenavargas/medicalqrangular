import { Component, OnInit } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { UniqueIdentifierCodeI } from '../../models/uic/uic.interface';
import { AppComponent } from 'src/app/app.component';
import { Guid } from "guid-typescript"


@Component({
  selector: 'app-uic',
  templateUrl: './uic.component.html',
  styleUrls: ['./uic.component.css']
})


export class UicComponent implements OnInit {

  loggedDoctorId = ''
  loggedProfile = ''
  loggedDoctorEmail = ''
  obtainedUniqueIdentifierCodesByDoctor: UniqueIdentifierCodeI[] = [];
  filteredUniqueIdentifierCodesByDoctor: UniqueIdentifierCodeI[] = [];

  constructor(private doctorService : DoctorDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedDoctorId = this.appComponent.loggedId;
    this.loggedProfile = this.appComponent.profile;
    this.loggedDoctorEmail = this.appComponent.userEmail;
    this.getUICByDoctorId("");
  }

  getUICByDoctorId(filteredStatus : string) {
    this.doctorService.getAllUICByDoctor(this.loggedDoctorId).subscribe(data => {
      this.obtainedUniqueIdentifierCodesByDoctor = data;
      if (filteredStatus.length > 0) {
        this.filterByState(filteredStatus);
      } else {
        this.filteredUniqueIdentifierCodesByDoctor = this.obtainedUniqueIdentifierCodesByDoctor;
      }
      console.log(this.filteredUniqueIdentifierCodesByDoctor.length)
    });     
  }

  saveNewUIC(){
    const newUIC = {
      id: Guid.create().toString(),
      status: "Pendiente",
      creationDate: new Date(),
      doctorId: this.loggedDoctorId
    }
    this.doctorService.addNewUIC(newUIC).subscribe(data => {
      this.getUICByDoctorId("Pendiente");
    });
    
  }

  onUpdateUIC(receivedId: string, receivedStatus : string, receivedCeationDate : Date, receivedDoctorId : string, filteredStatus : string ): void {
    const actualUIC = {
      status: receivedStatus,
      creationDate: receivedCeationDate,
      doctorId: receivedDoctorId
    }
    this.doctorService.updateUIC(actualUIC, receivedId).subscribe(data => {
      this.getUICByDoctorId(filteredStatus);
    });    
  }

  onDeleteUIC(receivedId: string, filteredStatus: string) : void {
    this.doctorService.deleteUIC(receivedId).subscribe(data => {
      this.getUICByDoctorId(filteredStatus);
    });
  }

  filterByState(selectedStatus: string) {
    this.filteredUniqueIdentifierCodesByDoctor = this.obtainedUniqueIdentifierCodesByDoctor.filter(uniquecode => uniquecode.status == selectedStatus)
  }

  sendUICByEmail(receivedId: string) {
    this.doctorService.sendNotificationUICById(receivedId, this.loggedDoctorEmail).subscribe(data => console.log("Email enviado"));
    
  }

}
