import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { TaskResponse } from '../dto/taskResponse';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TaskRequest } from '../dto/taskRequest';
import { Priority } from '../dto/priorityEnum';


interface GetResponseTasks{
  content: TaskResponse[],
  pages: {
    size: number,
    number: number,
    totalElements: number,
    totalPages: number
  }
}

@Injectable({
  providedIn: 'root',
})
export class Task {
  
  private baseUrl: string = `${environment.BASE_URL}/tasks`;

  private readonly http = inject(HttpClient);


  public getAllTasks(partialParams: {page: number, size: number}): Observable<GetResponseTasks>{
    let params = new HttpParams()
    .set('page', partialParams.page - 1)
    .set('size', partialParams.size);
    return this.http.get<GetResponseTasks>(this.baseUrl, {params});
  }

  public getTask(id: number): Observable<TaskResponse>{
    return this.http.get<TaskResponse>(`${this.baseUrl}/task/${id}`);
  }

  public addNewTask(request: TaskRequest): Observable<TaskResponse>{
    return this.http.post<TaskResponse>(`${this.baseUrl}/new-task`, request);
  }

  public updateTask(id: number, request: TaskRequest): Observable<TaskResponse>{
    return this.http.put<TaskResponse>(`${this.baseUrl}/update/${id}`, request);
  }

  public deleteTask(id: number){
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  public searchTasks(keyword: string, partialParams: {page: number, size: number}): Observable<GetResponseTasks>{
    let params = new HttpParams()
    .set('page', partialParams.page - 1)
    .set('size', partialParams.size);
    return this.http.get<GetResponseTasks>(`${this.baseUrl}/task/search/${keyword}`, {params});
  }

  public updatePriority(id: number, priority: Priority): Observable<TaskResponse>{
    return this.http.put<TaskResponse>(`${this.baseUrl}/${id}/priority`, priority);
  }


}
