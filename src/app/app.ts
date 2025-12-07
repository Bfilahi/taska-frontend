import { Component, inject, OnInit } from '@angular/core';
import { Navbar } from "./components/navbar/navbar";
import { Sidenav } from "./components/sidenavContainer/sidenav/sidenav";
import { User } from './services/user';
import { AuthService } from './services/auth-service';


@Component({
  selector: 'app-root',
  imports: [Navbar, Sidenav],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly userService = inject(User);
  private readonly authService = inject(AuthService);


  ngOnInit(): void {
    if (this.authService.isLoggedIn()){
      this.userService.getUser();
    }
  }
}
