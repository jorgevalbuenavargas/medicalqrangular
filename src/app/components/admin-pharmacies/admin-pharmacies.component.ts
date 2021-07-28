import { Component, OnInit, ViewChild } from '@angular/core';
import { PharmacyDataService } from 'src/app/pharmacy-data.service';
import { PharmacyI } from 'src/app/models/pharmacy/pharmacy.interface';
import { AppComponent } from 'src/app/app.component';
import * as XLSX from 'xlsx'; 
import { FormGroup, FormControl, Validators } from '@angular/forms';


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

    
  lastMonth = new Date().getFullYear() + "-" + this.getRealMonth(new Date(new Date().setMonth(new Date().getMonth() - 1)).getMonth()) + "-" + new Date().getDate()
  today = new Date().getFullYear() + "-" + this.getRealMonth(new Date().getMonth()) + "-" + new Date().getDate()

  constructor(private pharmacyDataService : PharmacyDataService, private appComponent : AppComponent) { }

  filtersForm = new FormGroup({
    fromDate: new FormControl({value: this.lastMonth, disabled: false}),
    toDate: new FormControl({value: this.today, disabled: false}),
    state: new FormControl({value: '', disabled: false}),
    pharmacyCUIT: new FormControl({value: '', disabled: false}, [ Validators.pattern("^[0-9]*$")]),
    companyName: new FormControl({value: '', disabled: false}),
    businessName: new FormControl({value: '', disabled: false})
    
  });

  ngOnInit(): void {
    this.loggedProfile = this.appComponent.profile;
    //this.getPharmacies("Inactivo");
  }

  getRealMonth(receivedMonth : number){
    let month : string[] = [];
    month[0] = "01";
    month[1] = "02";
    month[2] = "03";
    month[3] = "04";
    month[4] = "05";
    month[5] = "06";
    month[6] = "07";
    month[7] = "08";
    month[8] = "09";
    month[9] = "10";
    month[10] = "11";
    month[11] = "12";
    return month[receivedMonth]
  }

  onSubmit(){
    //this.toDate = this.filtersForm.controls.toDate.value      
    if (this.filtersForm.controls.fromDate.value.length > 0) {
      this.fromDate = this.filtersForm.controls.fromDate.value;
    } else {
      this.fromDate = '2001-01-01'
    }  
    if (this.filtersForm.controls.toDate.value.length > 0) {
      this.toDate = this.filtersForm.controls.toDate.value;
    } else {
      this.toDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).getFullYear() + '-12-31'
    }
    if (this.fromDate > this.toDate) {
      this.createAlertMessage("La fecha desde no puede ser superior a la fecha hasta.", "danger")
    } else {               
      this.filterByDates(this.fromDate, this.toDate)
    }  
  }


  filterPharmacyByState(state : string) {
    let temporalfilteredobtainedPharmacies = this.filteredobtainedPharmacies
    this.filteredobtainedPharmacies = [];
    for (let pharmacy of temporalfilteredobtainedPharmacies) {
      if (pharmacy.Status == state) {
        this.filteredobtainedPharmacies.push(pharmacy)
      }
    }
    if (this.filteredobtainedPharmacies.length == 0) {
      this.createAlertMessage("No se encontraron resultados para el estado " + state + ".", "danger")
    }     
  }

  filterByPharmacyData(data: string, value : string) {
    let temporalfilteredobtainedPharmacies = this.filteredobtainedPharmacies
    this.filteredobtainedPharmacies = [];
    for (let pharmacy of temporalfilteredobtainedPharmacies) {
      if (data == 'CUIT') {
        if (pharmacy.cuit == value) {
          this.filteredobtainedPharmacies.push(pharmacy)
        }
      } else if (data == 'companyName'){
        if (pharmacy.company_name.trim().toUpperCase().includes(value.trim().toUpperCase())) {
          this.filteredobtainedPharmacies.push(pharmacy)
        }
      } else {
        if (pharmacy.business_name.trim().toUpperCase().includes(value.trim().toUpperCase())) {
          this.filteredobtainedPharmacies.push(pharmacy)
        }
      }      
    }
    if (this.filteredobtainedPharmacies.length == 0) {
      this.createAlertMessage("No se encontraron resultados a partir de los datos ingresados.", "danger")
    }
  }

  /*submit(filterDates : any) {
    if (filterDates.form.controls.fromDate.value > filterDates.form.controls.toDate.value) {
      this.createAlertMessage("La fecha desde no puede ser superior a la fecha hasta.", "danger")
    } else {
      this.fromDate = filterDates.form.controls.fromDate.value;
      this.toDate = filterDates.form.controls.toDate.value
      this.filterByDates(this.fromDate, this.toDate)
    }
  }*/

  filterByDates(fromDate: string, toDate: string) {
    this.filteredobtainedPharmacies = [];
    this.selectedStatus = '';
    this.pharmacyDataService.getAllPharmacies().subscribe(data => { 
      this.obtainedPharmacies = data; 
      const dateFrom = new Date(fromDate)
      const dateTo = new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1))
      dateTo.setSeconds(dateTo.getSeconds() - 1)
      for (let pharmacy of this.obtainedPharmacies) {
        if (this.defineNewDate(new Date(pharmacy.creationDate)) >= dateFrom && this.defineNewDate(new Date(pharmacy.creationDate)) <= dateTo) {
          this.filteredobtainedPharmacies.push(pharmacy)
        }
      }
      if (this.filteredobtainedPharmacies.length == 0) {
        this.createAlertMessage("No se encontraron resultados para el rango de fechas indicado.", "danger")
      } else {
        if (this.filtersForm.controls.state.value.length > 0){          
          if (this.filtersForm.controls.state.value == 'Activo' || this.filtersForm.controls.state.value == 'Inactivo') {
            this.filterPharmacyByState(this.filtersForm.controls.state.value)
          }
        }
        if(this.filtersForm.controls.pharmacyCUIT.value.length > 0) {
          this.filterByPharmacyData("CUIT", this.filtersForm.controls.pharmacyCUIT.value )
        }
        if(this.filtersForm.controls.companyName.value.length > 0) {
          this.filterByPharmacyData("companyName", this.filtersForm.controls.companyName.value )
        }
        if(this.filtersForm.controls.businessName.value.length > 0) {
          this.filterByPharmacyData("businessName", this.filtersForm.controls.businessName.value )
        } 
      }      
    });
  }

  createAlertMessage(alertMessage : string, alertType : string){
    this.newAlertElement = document.createElement("div");
    this.newAlertElement.innerHTML = '<div class="alert alert-'+alertType+' alert-dismissible fade show" role="alert">' + 
    alertMessage + 
    '<button id="closeButton" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    this.titleContainer.nativeElement.appendChild(this.newAlertElement);
    this.closeAlertMessage();
  }

  closeAlertMessage() {
    setTimeout( () => { 
      let closeButton : HTMLElement = document.getElementById("closeButton") as HTMLElement;
      //console.log(closeButton)
      closeButton.click();
      }, 5000);
  }

  getPharmacies() {
    this.pharmacyDataService.getAllPharmacies().subscribe(data => { 
      this.obtainedPharmacies = data; 
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
  
  fileName= 'PharmaciesExcelSheet.xlsx';  

  exportexcel(): void {
    let element = document.getElementById('excel-table'); 
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
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

  defineNewDate(date : Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()))
  }

}
