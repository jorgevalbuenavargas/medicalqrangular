import { Injectable } from '@angular/core';
import { PharmacyI } from '../app/models/pharmacy/pharmacy.interface';
import { MedicalReceiptI } from '../app/models/medicalReceipts/medicalReceipt.interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {environment} from '../assets/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PharmacyDataService {
  
  private endpoint = environment.restService
  private urlAPI_Pharmacies = this.endpoint + '/api/pharmacies';
  private urlAPI_MedicalReceipts = this.endpoint + '/api/MedicalReceipts';
  //private urlAPI_Pharmacies = 'https://localhost:44355/api/pharmacies';
  //private urlAPI_MedicalReceipts = 'https://localhost:44355/api/MedicalReceipts';

  constructor(private http: HttpClient) { }

  getAllPharmacies():Observable<PharmacyI[]> {
    return this.http.get<PharmacyI[]>(this.urlAPI_Pharmacies)
  }

  getPharmacyById(pharmacyId : string):Observable<PharmacyI> {
    return this.http.get<PharmacyI>(this.urlAPI_Pharmacies + "/" + pharmacyId)
  }

  getPharmacyByProvider(providerId : string):Observable<PharmacyI[]> {
    return this.http.get<PharmacyI[]>(this.urlAPI_Pharmacies  + "?providerId=" + providerId)
  }

  updatePharmacy(modifiedPharmacy : PharmacyI, modifiedPharmacyID : String): Observable<any> {
    return this.http.put(this.urlAPI_Pharmacies + "/" + modifiedPharmacyID, modifiedPharmacy)
  }

  addNewMedicalReceipt(newMedicalReceipt : MedicalReceiptI): Observable<any> {
    return this.http.post(this.urlAPI_MedicalReceipts, newMedicalReceipt)
  }

  getAllMedicalReceipts():Observable<MedicalReceiptI[]> {
    return this.http.get<MedicalReceiptI[]>(this.urlAPI_MedicalReceipts)
  }

  getAllMedicalReceiptsByPharmacy(pharmacyId : string):Observable<MedicalReceiptI[]> {
    return this.http.get<MedicalReceiptI[]>(this.urlAPI_MedicalReceipts + "?pharmacyId=" + pharmacyId)
  }

  addNewPharmacy(newPharmacy : PharmacyI): Observable<any> {
    return this.http.post(this.urlAPI_Pharmacies, newPharmacy)
  }

}
