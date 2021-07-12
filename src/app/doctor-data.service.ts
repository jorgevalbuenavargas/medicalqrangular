import { Injectable } from '@angular/core';
import { UniqueIdentifierCodeI } from '../app/models/uic/uic.interface';
import { SecurityCodeI } from '../app/models/securitycode/securitycode.interface';
import { DoctorI } from '../app/models/doctor/doctor.interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class DoctorDataService {

  private urlAPI_UIC = 'https://localhost:44355/api/UniqueIdentifierCodes';
  private urlAPI_SC = 'https://localhost:44355/api/SecurityCodes';
  private urlAPI_Doctors = 'https://localhost:44355/api/Doctors';

  constructor(private http: HttpClient) { }

  getAllDoctors():Observable<DoctorI[]> {
    return this.http.get<DoctorI[]>(this.urlAPI_Doctors)
  }

  getDoctorById(doctorId : string):Observable<DoctorI> {
    return this.http.get<DoctorI>(this.urlAPI_Doctors + "/" + doctorId)
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
