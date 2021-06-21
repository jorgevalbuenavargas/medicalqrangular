import { Component, OnInit } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { UniqueIdentifierCodeI } from '../../models/uic/uic.interface';
import { Guid } from "guid-typescript"

@Component({
  selector: 'app-doctor-uic',
  templateUrl: './doctor-uic.component.html',
  styleUrls: ['./doctor-uic.component.css']
})
export class DoctorUicComponent implements OnInit {

  obtainedUniqueIdentifierCodes: UniqueIdentifierCodeI[] = [];
  obtainedUniqueIdentifierCodesByDoctor: UniqueIdentifierCodeI[] = [];
  obtainedUniqueIdentifierCodeByID!: UniqueIdentifierCodeI;
  
  constructor(private doctorService : DoctorDataService) { }

  ngOnInit(): void {
    //this.doctorService.getAllUIC().subscribe(data => this.obtainedUniqueIdentifierCodes = data );
    //this.doctorService.getAllUICByDoctor("EC1A7830-F706-45E8-BBCF-4440CD33E2EB").subscribe(data => this.obtainedUniqueIdentifierCodesByDoctor = data );
    //this.doctorService.getUICById("C2008DBE-5EA6-4CCF-A15E-A76EC676C28D").subscribe(data => this.obtainedUniqueIdentifierCodeByID = data );
    //this.doctorService.getAllUIC().subscribe(data => console.log(data) );
    this.getUICByDoctorId();
  }

  getUICByDoctorId() {
    this.doctorService.getAllUICByDoctor("EC1A7830-F706-45E8-BBCF-4440CD33E2EB").subscribe(data => this.obtainedUniqueIdentifierCodesByDoctor = data );
  }

  saveNewUIC(){
    const newUIC = {
      id: Guid.create().toString(),
      status: "Activo",
      creationDate: new Date(),
      doctorId: "ec1a7830-f706-45e8-bbcf-4440cd33e2eb"
    }
    //this.doctorService.addNewUIC(newUIC).subscribe(insertedUIC => this.obtainedUniqueIdentifierCodesByDoctor.push(insertedUIC))
    this.doctorService.addNewUIC(newUIC).subscribe();
    this.getUICByDoctorId();
    this.ngOnInit();
  }

  onUpdateUIC(receivedId: string, receivedStatus : string, receivedCeationDate : string, receivedDoctorId : string): void {
    const actualUIC = {
      status: receivedStatus,
      creationDate: new Date(receivedCeationDate),
      doctorId: receivedDoctorId
    }
    this.doctorService.updateUIC(actualUIC, receivedId).subscribe();
    this.getUICByDoctorId();
    this.ngOnInit();
  }

  onDeleteUIC(receivedId: string) : void {
    this.doctorService.deleteUIC(receivedId).subscribe();
    this.getUICByDoctorId();
    this.ngOnInit();
  }

}
