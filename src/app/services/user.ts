import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse } from '../dto/userResponse';
import { UserRequest } from '../dto/userRequest';
import { PasswordRequest } from '../dto/passwordRequest';

@Injectable({
  providedIn: 'root',
})
export class User {
  private baseUrl: string = `${environment.BASE_URL}/user`;
  public user = signal<UserResponse | null>(null);

  private readonly http = inject(HttpClient);

  private getUserInfo(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/info`);
  }

  public deleteUser() {
    return this.http.delete<void>(this.baseUrl);
  }

  public getUser() {
    if (!localStorage.getItem('user')) this.saveUser();
    this.user.set(JSON.parse(localStorage.getItem('user')!));
  }

  public updateProfile(request: UserRequest){
    return this.http.post<void>(`${this.baseUrl}/profile-update`, request);
  }

  public updatePassword(request: PasswordRequest){
    return this.http.post<void>(`${this.baseUrl}/password-update`, request);
  }

  private saveUser() {
    this.getUserInfo().subscribe({
      next: (response: UserResponse) => {
        this.user.set(response);
        localStorage.setItem('user', JSON.stringify(this.user()));
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }
}
