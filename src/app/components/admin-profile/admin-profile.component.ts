import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { AdminI } from 'src/app/models/admin/admin.interface';
import { AdminDataService } from 'src/app/admin-data.service';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit {

  loggedAdminId = ''
  loggedProfile = ''
  loggedAdminEmail = ''
  obtainedAdmin!: AdminI;

  constructor(private adminService : AdminDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedAdminId = this.appComponent.loggedId;
    this.loggedProfile = this.appComponent.profile;
    this.loggedAdminEmail = this.appComponent.userEmail;
    this.getAdminById()
  }

  getAdminById() {
    this.adminService.getAdminById(this.loggedAdminId).subscribe(data => {
      this.obtainedAdmin = data;
      //console.log(this.obtainedAdmin.name)
    })
  }

}
