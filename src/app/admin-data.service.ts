import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { AdminI } from './models/admin/admin.interface';
import {environment} from '../assets/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {

  private endpoint = environment.restService
  private urlAPI_Admins = this.endpoint + '/api/admins';

  constructor(private http: HttpClient) { }

  addNewAdmin(newAdmin : AdminI): Observable<any> {
    return this.http.post(this.urlAPI_Admins, newAdmin)
  }

  getAdminById(adminId : string):Observable<AdminI> {
    return this.http.get<AdminI>(this.urlAPI_Admins + "/" + adminId)
  }

  getAdminByProvider(providerId : string):Observable<AdminI[]> {
    return this.http.get<AdminI[]>(this.urlAPI_Admins  + "?providerId=" + providerId)
  }

}
