import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ProjectRequest } from '../dto/projectRequest';
import { Observable, Subject, tap } from 'rxjs';
import { ProjectResponse } from '../dto/projectResponse';
import { ProjectsStatsDTO } from '../dto/projectsStatsDTO';
import { ProjectStatsDTO } from '../dto/projectStatsDTO';


interface GetResponseProjects {
  content: ProjectResponse[];
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class Project {
  private baseUrl: string = `${environment.BASE_URL}/projects`;
  private readonly http = inject(HttpClient);

  private projectChangedSubject = new Subject<void>();
  public projectChanged$ = this.projectChangedSubject.asObservable();

  public projectsStats = signal<ProjectsStatsDTO>({
    totalProjects: 0,
    completedProjects: 0,
    overdueProjects: 0
  });
  public projectStats = signal<ProjectStatsDTO>({
    totalTasks: 0,
    completedTasks: 0,
    tasksInProgress: 0,
    overdueTasks: 0
  });


  public getAllProjects(partialParams: {
    page: number;
    size: number;
  }): Observable<GetResponseProjects> {
    let params = new HttpParams()
      .set('page', partialParams.page - 1)
      .set('size', partialParams.size);
    return this.http.get<GetResponseProjects>(this.baseUrl, { params });
  }

  public loadProjectsStatus() {
    this.http.get<ProjectsStatsDTO>(`${this.baseUrl}/stats`).subscribe({
      next: (response: ProjectsStatsDTO) => {
        this.projectsStats.set(response);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }

  public loadProjectStatus(id: number) {
    this.http.get<ProjectStatsDTO>(`${this.baseUrl}/stats/${id}`).subscribe({
      next: (response: ProjectStatsDTO) => {
        this.projectStats.set(response);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      },
    });
  }

  public getProject(id: number): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.baseUrl}/project/${id}`);
  }

  public addNewProject(request: ProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(`${this.baseUrl}/new-project`, request).
    pipe(
      tap(() => this.projectChangedSubject.next())
    );
  }

  public updateProject(id: number, request: ProjectRequest): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.baseUrl}/update/${id}`, request);
  }

  public deleteProject(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  public searchProjects(
    keyword: string,
    partialParams: { page: number; size: number }
  ): Observable<GetResponseProjects> {
    let params = new HttpParams()
      .set('page', partialParams.page - 1)
      .set('size', partialParams.size);
    return this.http.get<GetResponseProjects>(`${this.baseUrl}/project/search/${keyword}`, {
      params,
    });
  }

  public getOverdueProjects(partialParams: {page: number, size: number}): Observable<GetResponseProjects>{
    let params = new HttpParams()
    .set('page', partialParams.page - 1)
    .set('size', partialParams.size);
    return this.http.get<GetResponseProjects>(`${this.baseUrl}/p-overdue`, { params });
  }
}