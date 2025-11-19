import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProjectRequest } from '../dto/projectRequest';
import { Observable } from 'rxjs';
import { ProjectResponse } from '../dto/projectResponse';

interface GetResponseProjects{
  content: ProjectResponse[],
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
export class Project {
  private baseUrl: string = `${environment.BASE_URL}/projects`;

  private readonly http = inject(HttpClient);

  public getAllProjects(partialParams:{page: number, size: number}): Observable<GetResponseProjects> {
    let params = new HttpParams()
    .set('page', partialParams.page - 1)
    .set('size', partialParams.size);
    return this.http.get<GetResponseProjects>(this.baseUrl, {params});
  }

  public getProject(id: number): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.baseUrl}/project/${id}`);
  }

  public addNewProject(request: ProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(`${this.baseUrl}/new-project`, request);
  }

  public updateProject(id: number, request: ProjectRequest): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.baseUrl}/update/${id}`, request);
  }

  public deleteProject(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  public searchProjects(keyword: string, partialParams: {page: number, size: number}): Observable<GetResponseProjects> {
    let params = new HttpParams()
    .set('page', partialParams.page - 1)
    .set('size', partialParams.size);
    return this.http.get<GetResponseProjects>(`${this.baseUrl}/project/search/${keyword}`, {params});
  }
}
