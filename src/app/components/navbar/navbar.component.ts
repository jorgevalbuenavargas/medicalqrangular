import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import {Router} from "@angular/router"
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  profile = '';

  constructor(private afAuth: AngularFireAuth,  public appComponent : AppComponent, private router: Router) { }

  ngOnInit(): void {
    this.profile = this.appComponent.profile
  }

  logOff() {
    this.appComponent.loggedId = '';
    this.appComponent.profile = '';
    this.appComponent.userEmail = '';
    this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

}
