import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { AdminI } from './models/admin/admin.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {


  private urlAPI_Admins = 'https://localhost:44355/api/admins';

  constructor(private http: HttpClient) { }

  addNewAdmin(newAdmin : AdminI): Observable<any> {
    return this.http.post(this.urlAPI_Admins, newAdmin)
  }

  getAdminById(adminId : string):Observable<AdminI> {
    return this.http.get<AdminI>(this.urlAPI_Admins + "/" + adminId)
  }

}
