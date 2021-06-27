import { Injectable } from '@angular/core';
import { PharmacyI } from '../app/models/pharmacy/pharmacy.interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class PharmacyDataService {

  private urlAPI_Pharmacies = 'https://localhost:44355/api/pharmacies';

  constructor(private http: HttpClient) { }

  getAllPharmacies():Observable<PharmacyI[]> {
    return this.http.get<PharmacyI[]>(this.urlAPI_Pharmacies)
  }

  getPharmacyById(pharmacyId : string):Observable<PharmacyI> {
    return this.http.get<PharmacyI>(this.urlAPI_Pharmacies + "/" + pharmacyId)
  }

  updatePharmacy(modifiedPharmacy : PharmacyI, modifiedPharmacyID : String): Observable<any> {
    return this.http.put(this.urlAPI_Pharmacies + "/" + modifiedPharmacyID, modifiedPharmacy)
  }
}
