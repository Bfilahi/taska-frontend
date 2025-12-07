import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable, Subject, tap } from 'rxjs';
import { TaskResponse } from '../dto/taskResponse';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TaskRequest } from '../dto/taskRequest';


interface GetResponseTasks {
  content: TaskResponse[];
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class Task {
  private baseUrl: string = `${environment.BASE_URL}/tasks`;
  private readonly http = inject(HttpClient);

  private taskChangedSubject = new Subject<void>();
  public taskChanged$ = this.taskChangedSubject.asObservable();


  public notifyTaskChanged(){
    this.taskChangedSubject.next();
  }

  public getAllTasks(
    partialParams: { page: number; size: number },
    projectId: number
  ): Observable<GetResponseTasks> {
    let params = new HttpParams()
      .set('page', partialParams.page - 1)
      .set('size', partialParams.size);
    return this.http.get<GetResponseTasks>(`${this.baseUrl}/${projectId}`, { params });
  }

  public getTask(taskId: number, projectId: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.baseUrl}/task/${taskId}?projectId=${projectId}`);
  }

  public getOverdueTasks(partialParams: {page: number, size: number}, projectId: number): Observable<GetResponseTasks>{
    let params = new HttpParams()
    .set('page', partialParams.page - 1)
    .set('size', partialParams.size);
    return this.http.get<GetResponseTasks>(`${this.baseUrl}/t-overdue/${projectId}`, { params });
  }

  public addNewTask(request: TaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(`${this.baseUrl}/new-task`, request)
    .pipe(
      tap(() => this.notifyTaskChanged())
    );
  }

  public updateTask(taskId: number, request: TaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.baseUrl}/update/${taskId}`, request)
    .pipe(
      tap(() => this.notifyTaskChanged())
    );
  }

  public deleteTask(taskId: number, projectId: number) {
    return this.http.delete<void>(`${this.baseUrl}/delete/${taskId}?projectId=${projectId}`)
    .pipe(
      tap(() => this.notifyTaskChanged())
    );
  }

  public searchTasks(
    keyword: string,
    partialParams: { page: number; size: number }
  ): Observable<GetResponseTasks> {
    let params = new HttpParams()
      .set('page', partialParams.page - 1)
      .set('size', partialParams.size);
    return this.http.get<GetResponseTasks>(`${this.baseUrl}/task/search/${keyword}`, { params });
  }

  public toggleTaskCompletion(taskId: number, projectId: number): Observable<TaskResponse>{
    return this.http.post<TaskResponse>(`${this.baseUrl}/toggle/${taskId}?projectId=${projectId}`, null)
    .pipe(
      tap(() => this.notifyTaskChanged())
    );
  }

}
