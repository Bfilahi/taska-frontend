import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { SignupRequest } from '../dto/signupRequest';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl: string = `${environment.BASE_URL}/auth`;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  public isLoggedIn = signal<boolean>(false);


  constructor(){
    const token = localStorage.getItem('jwt');
    if(token)
      this.isLoggedIn.set(true);
  }


  public signup(request: SignupRequest) {
    return this.http.post(`${this.authUrl}/sign-up`, request);
  }

  public login(request: FormData): Observable<string> {
    return this.http.post<string>(`${this.authUrl}/sign-in`, request, {responseType: 'text' as 'json'}).pipe(
      tap((response) => {
        this.saveToken(response);
        this.isLoggedIn.set(true);
      })
    );
  }

  private saveToken(token: string){
    localStorage.setItem('jwt', token);
  }

  public logout(){
    localStorage.removeItem('jwt');
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }
}
