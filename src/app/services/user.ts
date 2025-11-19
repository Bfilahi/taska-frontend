import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse } from '../dto/userResponse';

@Injectable({
  providedIn: 'root',
})
export class User {

  private baseUrl: string = `${environment.BASE_URL}/user`;

  private readonly http = inject(HttpClient);


  public getUserInfo(): Observable<UserResponse>{
    return this.http.get<UserResponse>(`${this.baseUrl}/info`);
  }

  public deleteUser(){
    return this.http.delete<void>(this.baseUrl);
  }
  
}
