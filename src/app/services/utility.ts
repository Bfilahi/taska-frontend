import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Utility {
  public opened = signal<boolean>(true);
  public isDarkMode = signal<boolean>(false);

  constructor() {
    if (localStorage.getItem('dark')) this.isDarkMode.set(true);
  }

  public toggleTheme() {
    this.isDarkMode.set(!this.isDarkMode());
    if (this.isDarkMode()) localStorage.setItem('dark', 'active');
    else localStorage.removeItem('dark');
  }
}
