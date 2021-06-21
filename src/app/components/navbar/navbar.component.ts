import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  profile = '';

  constructor(private appComponent : AppComponent) { }

  ngOnInit(): void {
    this.profile = this.appComponent.profile
  }

}
