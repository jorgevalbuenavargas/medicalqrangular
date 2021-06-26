import { Component, OnInit } from '@angular/core';
import { PharmacyDataService } from 'src/app/pharmacy-data.service';
import { PharmacyI } from 'src/app/models/pharmacy/pharmacy.interface';
import { AppComponent } from 'src/app/app.component';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-admin-pharmacies',
  templateUrl: './admin-pharmacies.component.html',
  styleUrls: ['./admin-pharmacies.component.css']
})
export class AdminPharmaciesComponent implements OnInit {

  loggedProfile = '';
  obtainedPharmacies: PharmacyI[] = [];
  filteredobtainedPharmacies: PharmacyI[] = [];

  constructor(private pharmacyDataService : PharmacyDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedProfile = this.appComponent.profile;
    this.getPharmacies("Inactivo");
  }

  getPharmacies(filteredStatus : string) {
    this.pharmacyDataService.getAllPharmacies().subscribe(data => { 
      this.obtainedPharmacies = data; 
      if (filteredStatus.length > 0) {
      this.filterByState(filteredStatus);
    } else {
      this.filteredobtainedPharmacies = this.obtainedPharmacies;
    }
    });
  }
  

  filterByState(selectedStatus: string) {
    this.filteredobtainedPharmacies = this.obtainedPharmacies.filter(pharmacy => pharmacy.Status == selectedStatus)
  }
  
  /*name of the excel-file which will be downloaded. */ 
  fileName= 'PharmaciesExcelSheet.xlsx';  

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

  onUpdatePharmacy(receivedId: string, receivedStatus : string, receivedCuit : string, receivedCompanyName : string, receivedBusinessName : string, receivedEmail : string): void {
    const actualPharmacy = {
      cuit : receivedCuit,
      company_name : receivedCompanyName,
      business_name : receivedBusinessName,
      Status : receivedStatus,
      email : receivedEmail
    }
    console.log(actualPharmacy)
    console.log(receivedId)
    this.pharmacyDataService.updatePharmacy(actualPharmacy, receivedId).subscribe(data => {
          this.getPharmacies(receivedStatus);
    })    
  }

}
