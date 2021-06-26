import { Component, OnInit } from '@angular/core';
import { DoctorDataService } from '../../doctor-data.service';
import { DoctorI } from '../../models/doctor/doctor.interface';
import { AppComponent } from 'src/app/app.component';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-admin-doctors',
  templateUrl: './admin-doctors.component.html',
  styleUrls: ['./admin-doctors.component.css']
})
export class AdminDoctorsComponent implements OnInit {

  loggedProfile = '';
  obtainedDoctors: DoctorI[] = [];
  filteredobtainedDoctors: DoctorI[] = [];

  constructor(private doctorService : DoctorDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedProfile = this.appComponent.profile;
    this.getDoctors("Inactivo");

  }

  getDoctors(filteredStatus : string) {
    this.doctorService.getAllDoctors().subscribe(data => { 
      this.obtainedDoctors = data; 
      if (filteredStatus.length > 0) {
      this.filterByState(filteredStatus);
    } else {
      this.filteredobtainedDoctors = this.obtainedDoctors;
    }
    console.log(this.filteredobtainedDoctors.length)
  });
  }

  filterByState(selectedStatus: string) {
    this.filteredobtainedDoctors = this.obtainedDoctors.filter(doctor => doctor.Status == selectedStatus)
  }
  
  /*name of the excel-file which will be downloaded. */ 
  fileName= 'DoctorsExcelSheet.xlsx';  

  exportexcel(): void {
    /* table id is passed over here */   
    let element = document.getElementById('excel-table'); 
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
        
  }

  onUpdateDoctor(receivedId: string, receivedStatus : string, receivedName : string, receivedLastName : string, receivedMedicalLicense : string, receivedEmail : string): void {
    const actualDoctor = {
      name : receivedName,
      lastName : receivedLastName,
      medicalLicense : receivedMedicalLicense,
      Status : receivedStatus,
      email : receivedEmail
    }
    this.doctorService.updateDoctor(actualDoctor, receivedId).subscribe(data => {
      this.getDoctors(receivedStatus);
    })
  }
}

