import { Component, OnInit } from '@angular/core';
import { PharmacyI } from 'src/app/models/pharmacy/pharmacy.interface';
import { PharmacyDataService } from 'src/app/pharmacy-data.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-pharmacy-profile',
  templateUrl: './pharmacy-profile.component.html',
  styleUrls: ['./pharmacy-profile.component.css']
})
export class PharmacyProfileComponent implements OnInit {

  loggedPharmacyId = ''
  loggedProfile = ''
  loggedPharmacyEmail = ''
  obtainedPharmacy!: PharmacyI;

  constructor(private pharmacyService : PharmacyDataService, private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.loggedPharmacyId = this.appComponent.loggedId;
    this.loggedProfile = this.appComponent.profile;
    this.loggedPharmacyEmail = this.appComponent.userEmail;
    this.getPharmacyById()
  }

  getPharmacyById() {
    this.pharmacyService.getPharmacyById(this.loggedPharmacyId).subscribe(data => {
      this.obtainedPharmacy = data;
      let customedCuit = this.obtainedPharmacy.cuit.slice(0, 2) + "-" + this.obtainedPharmacy.cuit.slice(2, 10) + "-" + this.obtainedPharmacy.cuit.slice(10, 11)
      this.obtainedPharmacy.cuit = customedCuit
    })
  }

}
