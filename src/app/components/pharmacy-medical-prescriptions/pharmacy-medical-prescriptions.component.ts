import { Component, OnInit, ViewChild } from '@angular/core';
import { PharmacyDataService } from 'src/app/pharmacy-data.service';
import { DoctorDataService } from 'src/app/doctor-data.service';
import { MedicalReceiptI } from 'src/app/models/medicalReceipts/medicalReceipt.interface';
import { CustomizeMedicalReceiptI } from 'src/app/models/customizeMedicalReceipts/customizeMedicalReceipts.interface';
import { AppComponent } from 'src/app/app.component';
import * as XLSX from 'xlsx'; 
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PharmacyI } from 'src/app/models/pharmacy/pharmacy.interface';
import { DoctorI } from 'src/app/models/doctor/doctor.interface';
import { UniqueIdentifierCodeI } from 'src/app/models/uic/uic.interface';

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
  obtainedDoctors: DoctorI[] = [];
  obtainedPharmacies: PharmacyI[] = [];
  obtainedUICs: UniqueIdentifierCodeI[] = [];
  lastMonth = new Date().getFullYear() + "-" + this.getRealMonth(new Date(new Date().setMonth(new Date().getMonth() - 1)).getMonth()) + "-" + new Date().getDate()
  today = new Date().getFullYear() + "-" + this.getRealMonth(new Date().getMonth()) + "-" + new Date().getDate()

  constructor(private pharmacyDataService : PharmacyDataService, private doctoryDataService : DoctorDataService, private appComponent : AppComponent) { }

  filtersForm = new FormGroup({
    fromDate: new FormControl({value: this.lastMonth, disabled: false}),
    toDate: new FormControl({value: this.today, disabled: false}),
    state: new FormControl({value: '', disabled: false}),
    companyName: new FormControl({value: '', disabled: false}),
    businessName: new FormControl({value: '', disabled: false}),
    doctorName: new FormControl({value: '', disabled: false}),
    validationMessage: new FormControl({value: '', disabled: false})
    
  });

  ngOnInit(): void {
    this.loggedProfile = this.appComponent.profile; 
    this.getDoctors();
    this.getPharmacies();
    this.getUIC();   
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

  /*submit(filterDates : any) {
    if (filterDates.form.controls.fromDate.value > filterDates.form.controls.toDate.value) {
      this.createAlertMessage("La fecha desde no puede ser superior a la fecha hasta.", "danger")
    } else {
      this.fromDate = filterDates.form.controls.fromDate.value;
      this.toDate = filterDates.form.controls.toDate.value
      this.filterByDates(this.fromDate, this.toDate)
    }
  }*/

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


  /*filterByDates(fromDate: string, toDate: string) {
    this.obtainedMedicalReceipts = [];
    this.customizeMedicalReceipts = [];
    this.filteredObtainedMedicalReceipts = [];
    this.pharmacyDataService.getAllMedicalReceiptsByPharmacy(this.appComponent.loggedId).subscribe(data => { 
      this.obtainedMedicalReceipts = data; 
      for (let medicalReceipt of this.obtainedMedicalReceipts) {
      const dateFrom = new Date(fromDate)
      const dateTo = new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1))
      dateTo.setSeconds(dateTo.getSeconds() - 1)
        if (this.defineNewDate(new Date(medicalReceipt.scanDate)) >= dateFrom && this.defineNewDate(new Date(medicalReceipt.scanDate)) <= dateTo) {
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
  }*/

  getPharmacies() {
    this.pharmacyDataService.getAllPharmacies().subscribe(data => { 
      this.obtainedPharmacies = data; 
    });
  }

  getDoctors() {
    this.doctoryDataService.getAllDoctors().subscribe(data => { 
      this.obtainedDoctors = data; 
    });
  }

  getUIC() {
    this.doctoryDataService.getAllUIC().subscribe(data => { 
      this.obtainedUICs = data; 
    });
  }

  filterByDates(fromDate: string, toDate: string) {
    this.obtainedMedicalReceipts = [];
    this.customizeMedicalReceipts = [];
    this.filteredObtainedMedicalReceipts = [];
    this.pharmacyDataService.getAllMedicalReceiptsByPharmacy(this.appComponent.loggedId).subscribe(data => { 
      this.obtainedMedicalReceipts = data; 
      for (let medicalReceipt of this.obtainedMedicalReceipts) {          
        const dateFrom = new Date(fromDate)
        const dateTo = new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1))
        dateTo.setSeconds(dateTo.getSeconds() - 1)            
        if (this.defineNewDate(new Date(medicalReceipt.scanDate)) >= dateFrom && this.defineNewDate(new Date(medicalReceipt.scanDate)) <= dateTo) {
          this.filteredObtainedMedicalReceipts.push(medicalReceipt)
          let foundPharmacy = this.obtainedPharmacies.find(obj => obj.id?.toString().toUpperCase().trim() == medicalReceipt.pharmacyId.toString().toUpperCase().trim());
          let foundUIC = this.obtainedUICs.find(obj => obj.id?.toString().toUpperCase().trim() == medicalReceipt.uicId.toString().toUpperCase().trim());
          if (foundUIC == undefined) {
            const newCustomizeMedicalReceipt : CustomizeMedicalReceiptI = {
              scanDate : medicalReceipt.scanDate,
              doctorName : 'No encontrado',
              pharmacyBusinessName : foundPharmacy!.business_name,
              pharmacyCompanyName : foundPharmacy!.company_name,
              validationResult : medicalReceipt.validationResult,
              applicationMessage : medicalReceipt.applicationMessage
            };
            this.customizeMedicalReceipts.push(newCustomizeMedicalReceipt)  
          } else {
            let foundDoctor = this.obtainedDoctors.find(obj => obj.id == foundUIC?.doctorId);
            const newCustomizeMedicalReceipt : CustomizeMedicalReceiptI = {
              scanDate : medicalReceipt.scanDate,
              doctorName : foundDoctor!.name + " " + foundDoctor!.lastName,
              pharmacyBusinessName : foundPharmacy!.business_name,
              pharmacyCompanyName : foundPharmacy!.company_name,
              validationResult : medicalReceipt.validationResult,
              applicationMessage : medicalReceipt.applicationMessage
            };
            this.customizeMedicalReceipts.push(newCustomizeMedicalReceipt)
          }               
        }
      }
      if (this.customizeMedicalReceipts.length == 0) {
        this.createAlertMessage("No se encontraron resultados para el rango de fechas indicado.", "danger")
      } else { 
        if (this.filtersForm.controls.state.value.length > 0){  
                
          if (this.filtersForm.controls.state.value == 'Fallido' || this.filtersForm.controls.state.value == 'Exitoso') {
            this.filterMedicalReceiptByState(this.filtersForm.controls.state.value)
          }
        }
        if(this.filtersForm.controls.doctorName.value.length > 0) {
          this.filterByData("doctorName", this.filtersForm.controls.doctorName.value )
        }
        if(this.filtersForm.controls.companyName.value.length > 0) {
          this.filterByData("companyName", this.filtersForm.controls.companyName.value )
        }
        if(this.filtersForm.controls.businessName.value.length > 0) {
          this.filterByData("businessName", this.filtersForm.controls.businessName.value )
        } 
        if(this.filtersForm.controls.validationMessage.value.length > 0) {
          this.filterByData("validationMessage", this.filtersForm.controls.validationMessage.value )
        } 
      }

    });
  }

  filterMedicalReceiptByState(state : string) {
    let temporalfilteredObtainedMedicalReceipts = this.customizeMedicalReceipts
    this.customizeMedicalReceipts = [];
    for (let medicalReceipt of temporalfilteredObtainedMedicalReceipts) {
      if (medicalReceipt.validationResult == state) {
        this.customizeMedicalReceipts.push(medicalReceipt)
      }
    }
    if (this.customizeMedicalReceipts.length == 0) {
      this.createAlertMessage("No se encontraron resultados para el estado " + state + ".", "danger")
    }     
  }

  filterByData(data: string, value : string) {
    let temporalfilteredObtainedMedicalReceipts = this.customizeMedicalReceipts
    this.customizeMedicalReceipts = [];
    for (let medicalReceipt of temporalfilteredObtainedMedicalReceipts) {
      if (data == 'doctorName') {
        if (medicalReceipt.doctorName.trim().toUpperCase().includes(value.trim().toUpperCase())) {
          this.customizeMedicalReceipts.push(medicalReceipt)
        }
      } else if (data == 'companyName'){
        if (medicalReceipt.pharmacyCompanyName.trim().toUpperCase().includes(value.trim().toUpperCase())) {
          this.customizeMedicalReceipts.push(medicalReceipt)
        }
      }else if (data == 'businessName'){
        if (medicalReceipt.pharmacyBusinessName.trim().toUpperCase().includes(value.trim().toUpperCase())) {
          this.customizeMedicalReceipts.push(medicalReceipt)
        }
      } else {
        if (medicalReceipt.applicationMessage.trim().toUpperCase().includes(value.trim().toUpperCase())) {
          this.customizeMedicalReceipts.push(medicalReceipt)
        }
      }      
    }
    if (this.customizeMedicalReceipts.length == 0) {
      this.createAlertMessage("No se encontraron resultados a partir de los datos ingresados.", "danger")
    }
  }

  fileName= 'MedicalReceiptsExcelSheet.xlsx';  

  exportexcel(): void { 
    let element = document.getElementById('excel-table'); 
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, this.fileName);
        
  }

  defineNewDate(date : Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()))
  }

}


