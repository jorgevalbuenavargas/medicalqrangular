import { Component, OnInit, ViewChild } from '@angular/core';
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

  @ViewChild('alertContainer', { static: true }) 
  public titleContainer: any;
  public newAlertElement: any;
  loggedProfile = '';
  obtainedPharmacies: PharmacyI[] = [];
  filteredobtainedPharmacies: PharmacyI[] = [];
  fromDate: any;
  toDate: any;
  selectedStatus = '';

  constructor(private pharmacyDataService : PharmacyDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedProfile = this.appComponent.profile;
    //this.getPharmacies("Inactivo");
  }

  submit(filterDates : any) {
    if (filterDates.form.controls.fromDate.value > filterDates.form.controls.toDate.value) {
      this.createAlertMessage("La fecha desde no puede ser superior a la fecha hasta.", "danger")
    } else {
      this.fromDate = filterDates.form.controls.fromDate.value;
      this.toDate = filterDates.form.controls.toDate.value
      this.filterByDates(this.fromDate, this.toDate)
    }
  }

  createAlertMessage(alertMessage : string, alertType : string){
    this.newAlertElement = document.createElement("div");
    this.newAlertElement.innerHTML = '<div class="alert alert-'+alertType+' alert-dismissible fade show" role="alert">' + 
    alertMessage + 
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    this.titleContainer.nativeElement.appendChild(this.newAlertElement);
  }

  getPharmacies() {
    this.pharmacyDataService.getAllPharmacies().subscribe(data => { 
      this.obtainedPharmacies = data; 
    });
  }

  filterByDates(fromDate: string, toDate: string) {
    this.filteredobtainedPharmacies = [];
    this.selectedStatus = '';
    this.pharmacyDataService.getAllPharmacies().subscribe(data => { 
      this.obtainedPharmacies = data; 
      for (let pharmacy of this.obtainedPharmacies) {
        if (new Date(pharmacy.creationDate) >= new Date(fromDate) && new Date(pharmacy.creationDate) <= new Date(toDate)) {
          this.filteredobtainedPharmacies.push(pharmacy)
        }
      }
      if (this.filteredobtainedPharmacies.length == 0) {
        this.createAlertMessage("No se encontraron resultados para el rango de fechas indicado.", "danger")
      }
    });
  }

  getFilteredPharmacies(filteredStatus : string) {
    this.filteredobtainedPharmacies = [];
    this.selectedStatus = filteredStatus;
    this.pharmacyDataService.getAllPharmacies().subscribe(data => { 
      this.obtainedPharmacies = data; 
      this.filterByState(filteredStatus);
      if(this.filteredobtainedPharmacies.length == 0) {
        this.createAlertMessage("No se encontraron resultados para el estado " + filteredStatus + ".", "danger")
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

  onUpdatePharmacy(receivedId: string, receivedStatus : string, receivedCuit : string, receivedCompanyName : string, receivedBusinessName : string, receivedEmail : string, receivedCreationDate : Date): void {
    const actualPharmacy = {
      cuit : receivedCuit,
      company_name : receivedCompanyName,
      business_name : receivedBusinessName,
      Status : receivedStatus,
      email : receivedEmail,
      creationDate : receivedCreationDate
    }
    //console.log(actualPharmacy)
    //console.log(receivedId)
    this.pharmacyDataService.updatePharmacy(actualPharmacy, receivedId).subscribe(data => {
          //this.getPharmacies(receivedStatus);
          if (this.selectedStatus.length == 0){
            this.filterByDates(this.fromDate, this.toDate)
          }else {
            this.getFilteredPharmacies(this.selectedStatus)
          }
          this.createAlertMessage("Farmacia modificada con éxito", "success");
    })    
  }

}
