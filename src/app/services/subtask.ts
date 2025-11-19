import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskResponse } from '../dto/taskResponse';
import { SubtaskResponse } from '../dto/subtaskResponse';
import { SubtaskRequest } from '../dto/subtaskRequest';


interface GetResponseSubtasks{
  content: TaskResponse[],
  page: {
    size: number,
    number: number,
    totalElements: number,
    totalPages: number
  }
}

@Injectable({
  providedIn: 'root',
})
export class Subtask {
  
  private baseUrl: string = `${environment.BASE_URL}/subtasks`;

  private readonly http = inject(HttpClient);


  public getSubTasks(id: number, partialParams: {page: number, size: number}): Observable<GetResponseSubtasks>{
    let params = new HttpParams()
    .set('page', partialParams.page - 1)
    .set('size', partialParams.size);
    return this.http.get<GetResponseSubtasks>(`${this.baseUrl}/${id}/subtasks`, {params});
  }

  public addNewSubtask(request: SubtaskRequest): Observable<SubtaskResponse>{
    return this.http.post<SubtaskResponse>(`${this.baseUrl}/new-subtask`, request);
  }

  public updateSubtask(id: number, request: SubtaskRequest): Observable<SubtaskResponse>{
    return this.http.put<SubtaskResponse>(`${this.baseUrl}/${id}`, request);
  }

  public deleteSubtask(subtaskId: number, taskId: number){
    let params = new HttpParams().set('taskId', taskId);
    return this.http.delete<void>(`${this.baseUrl}/${subtaskId}`, {params});
  }
}
