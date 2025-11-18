import { Component } from '@angular/core';
import { Navbar } from "./components/navbar/navbar";
import { Sidenav } from "./components/sidenavContainer/sidenav/sidenav";


@Component({
  selector: 'app-root',
  imports: [Navbar, Sidenav],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
