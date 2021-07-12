import { Component, OnInit, ViewChild } from '@angular/core';
import { PharmacyDataService } from 'src/app/pharmacy-data.service';
import { DoctorDataService } from 'src/app/doctor-data.service';
import { MedicalReceiptI } from 'src/app/models/medicalReceipts/medicalReceipt.interface';
import { CustomizeMedicalReceiptI } from 'src/app/models/customizeMedicalReceipts/customizeMedicalReceipts.interface';
import { AppComponent } from 'src/app/app.component';
import * as XLSX from 'xlsx'; 

@Component({
  selector: 'app-pharmacy-medical-prescriptions',
  templateUrl: './pharmacy-medical-prescriptions.component.html',
  styleUrls: ['./pharmacy-medical-prescriptions.component.css']
})
export class PharmacyMedicalPrescriptionsComponent implements OnInit {

  @ViewChild('alertContainer', { static: true }) 
  public titleContainer: any;
  public newAlertElement: any;
  obtainedMedicalReceipts: MedicalReceiptI[] = [];
  filteredObtainedMedicalReceipts: MedicalReceiptI[] = [];
  customizeMedicalReceipts : CustomizeMedicalReceiptI[] = [];
  loggedProfile = '';
  fromDate: any;
  toDate: any;

  constructor(private pharmacyDataService : PharmacyDataService, private doctoryDataService : DoctorDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedProfile = this.appComponent.profile;    
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


  filterByDates(fromDate: string, toDate: string) {
    this.obtainedMedicalReceipts = [];
    this.customizeMedicalReceipts = [];
    this.filteredObtainedMedicalReceipts = [];
    this.pharmacyDataService.getAllMedicalReceiptsByPharmacy(this.appComponent.loggedId).subscribe(data => { 
      this.obtainedMedicalReceipts = data; 
      for (let medicalReceipt of this.obtainedMedicalReceipts) {
        if (new Date(medicalReceipt.scanDate) >= new Date(fromDate) && new Date(medicalReceipt.scanDate) <= new Date(toDate)) {
          this.filteredObtainedMedicalReceipts.push(medicalReceipt)                              
          this.pharmacyDataService.getPharmacyById(medicalReceipt.pharmacyId).subscribe(pharmacyData => {            
            this.doctoryDataService.getUICById(medicalReceipt.uicId).subscribe(uicData => {
              this.doctoryDataService.getDoctorById(uicData.doctorId).subscribe(doctorData => {                
                const newCustomizeMedicalReceipt : CustomizeMedicalReceiptI = {
                  scanDate : medicalReceipt.scanDate,
                  doctorName : doctorData.name + " " + doctorData.lastName,
                  pharmacyBusinessName : pharmacyData.business_name,
                  pharmacyCompanyName : pharmacyData.company_name,
                  validationResult : medicalReceipt.validationResult,
                  applicationMessage : medicalReceipt.applicationMessage
                };
                this.customizeMedicalReceipts.push(newCustomizeMedicalReceipt)                
              })
              
            },
            error => {        
              const newCustomizeMedicalReceipt : CustomizeMedicalReceiptI = {
                scanDate : medicalReceipt.scanDate,
                doctorName : 'No encontrado',
                pharmacyBusinessName : pharmacyData.business_name,
                pharmacyCompanyName : pharmacyData.company_name,
                validationResult : medicalReceipt.validationResult,
                applicationMessage : medicalReceipt.applicationMessage
              };
              this.customizeMedicalReceipts.push(newCustomizeMedicalReceipt)   
            })
          })          
        }
      }
      //console.log(this.filteredObtainedMedicalReceipts.length)
      if (this.filteredObtainedMedicalReceipts.length == 0) {
        this.createAlertMessage("No se encontraron resultados para el rango de fechas indicado.", "danger")
      }

    });
  }

  /*name of the excel-file which will be downloaded. */ 
  fileName= 'MedicalReceiptsExcelSheet.xlsx';  

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

}
