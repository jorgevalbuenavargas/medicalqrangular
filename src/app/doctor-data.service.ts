import { Injectable } from '@angular/core';
import { UniqueIdentifierCodeI } from '../app/models/uic/uic.interface';
import { SecurityCodeI } from '../app/models/securitycode/securitycode.interface';
import { DoctorI } from '../app/models/doctor/doctor.interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {environment} from '../assets/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DoctorDataService {

  private endpoint = environment.restService
  private urlAPI_UIC = this.endpoint + '/api/UniqueIdentifierCodes';
  private urlAPI_SC = this.endpoint + '/api/SecurityCodes';
  private urlAPI_Doctors = this.endpoint + '/api/Doctors';

  constructor(private http: HttpClient) { }

  getAllDoctors():Observable<DoctorI[]> {
    return this.http.get<DoctorI[]>(this.urlAPI_Doctors)
  }

  getDoctorById(doctorId : string):Observable<DoctorI> {
    return this.http.get<DoctorI>(this.urlAPI_Doctors + "/" + doctorId)
  }

  getDoctorByProvider(providerId : string):Observable<DoctorI[]> {
    return this.http.get<DoctorI[]>(this.urlAPI_Doctors  + "?providerId=" + providerId)
  }

  updateDoctor(modifiedDoctor : DoctorI, modifiedDoctorID : String): Observable<any> {
    return this.http.put(this.urlAPI_Doctors + "/" + modifiedDoctorID, modifiedDoctor)
  }

  updateSecurityCode(modifiedSecurityCode : SecurityCodeI, modifiedSecurityCodeID : String): Observable<any> {
    return this.http.put(this.urlAPI_SC + "/" + modifiedSecurityCodeID, modifiedSecurityCode)
  }

  getAllUIC():Observable<UniqueIdentifierCodeI[]> {
    return this.http.get<UniqueIdentifierCodeI[]>(this.urlAPI_UIC)
  }

  getAllUICByDoctor(doctorId : string):Observable<UniqueIdentifierCodeI[]> {
    return this.http.get<UniqueIdentifierCodeI[]>(this.urlAPI_UIC + "?doctorId=" + doctorId)
  }

  getUICById(uicId : string):Observable<UniqueIdentifierCodeI> {
    return this.http.get<UniqueIdentifierCodeI>(this.urlAPI_UIC + "/" + uicId)
  }

  sendNotificationUICById(uicId : string, email : string):Observable<UniqueIdentifierCodeI> {
    return this.http.get<UniqueIdentifierCodeI>(this.urlAPI_UIC + "?id=" + uicId + "&email=" + email)
  }

  sendNotificationPendingUIC(doctorId : string, email : string):Observable<UniqueIdentifierCodeI> {
    return this.http.get<UniqueIdentifierCodeI>(this.urlAPI_UIC + "?doctorId=" + doctorId + "&email=" + email)
  }

  sendNotificationSecurityCodeById(securityCodeId : string, email : string):Observable<SecurityCodeI> {
    return this.http.get<SecurityCodeI>(this.urlAPI_SC + "?id=" + securityCodeId + "&email=" + email)
  }

  addNewUIC(newUniqueIdentifierCode : UniqueIdentifierCodeI): Observable<any> {
    return this.http.post(this.urlAPI_UIC, newUniqueIdentifierCode)
  }

  addNewDoctor(newDoctor : DoctorI): Observable<any> {
    return this.http.post(this.urlAPI_Doctors, newDoctor)
  }

  updateUIC(modifiedUniqueIdentifierCode : UniqueIdentifierCodeI, modifiedUniqueIdentifierCodeID : String): Observable<any> {
    return this.http.put(this.urlAPI_UIC + "/" + modifiedUniqueIdentifierCodeID, modifiedUniqueIdentifierCode)
  }
  
  deleteUIC(uicId : string):Observable<{}> {
    return this.http.delete(this.urlAPI_UIC + "/" + uicId)
  }

  getAllSecurityCodesByDoctor(doctorId : string):Observable<SecurityCodeI[]> {
    return this.http.get<SecurityCodeI[]>(this.urlAPI_SC + "?doctorId=" + doctorId)
  }
  addNewSecurityCode(newSecurityCode : SecurityCodeI): Observable<any> {
    return this.http.post(this.urlAPI_SC, newSecurityCode)
  }

}
