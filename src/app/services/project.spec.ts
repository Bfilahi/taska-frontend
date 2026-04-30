import { TestBed } from '@angular/core/testing';

import { GetResponseProjects, Project } from './project';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment.development';
import { Priority } from '../enum/priorityEnum';
import { Status } from '../enum/statusEnum';
import { ProjectsStatsDTO } from '../dto/projectsStatsDTO';
import { ProjectStatsDTO } from '../dto/projectStatsDTO';
import { ProjectRequest } from '../dto/projectRequest';

describe('Project', () => {
  let service: Project;

  const partialParams = { page: 1, size: 10 };
  const baseUrl: string = `${environment.BASE_URL}/projects`;
  const id: number = 3;

  let httpTestingController: HttpTestingController;

  let mockGetResponseProjects: GetResponseProjects;
  let mockProjectsStatsDTO: ProjectsStatsDTO;
  let mockProjectStatsDTO: ProjectStatsDTO;
  let mockProjectRequest: ProjectRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    mockGetResponseProjects = {
      content: [
        {
          id: 1,
          name: 'some project name',
          description: 'some project description',
          startDate: new Date(2025, 9, 3),
          dueDate: new Date(2025, 10, 12),
          priority: Priority.LOW,
          status: Status.ACTIVE,
          progress: 30,
        }
      ],
      page: {
        size: 3,
        number: 2,
        totalElements: 5,
        totalPages: 4,
      }
    }

    mockProjectsStatsDTO = {
      totalProjects: 7,
      completedProjects: 2,
      overdueProjects: 1,
    }

    mockProjectStatsDTO = {
      totalTasks: 7,
      completedTasks: 2,
      tasksInProgress: 4,
      overdueTasks: 1,
    }

    mockProjectRequest = {
      name: 'project name',
      description: 'project description',
      dueDate: new Date(2025, 7, 9),
      priority: Priority.HIGH,
      status: Status.ACTIVE,
    }

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(Project);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllProjects()', () => {
    it('should call GET /projects with correct page (page - 1) and size params', () => {
      service.getAllProjects(partialParams).subscribe();

      const req = httpTestingController.expectOne(request => request.url === baseUrl);
      req.flush(mockGetResponseProjects);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe(`${partialParams.page - 1}`);
      expect(req.request.params.get('size')).toBe(`${partialParams.size}`);
    });

    it('should return an observable with paginated project data', () => {
      service.getAllProjects(partialParams).subscribe(res => expect(res).toEqual(mockGetResponseProjects));

      const req = httpTestingController.expectOne(request => request.url === baseUrl);
      req.flush(mockGetResponseProjects);
    });
  });

  describe('loadProjectsStatus()', () => {
    it('should call GET /projects/stats and update projectsStats signal', () => {
      service.loadProjectsStatus();

      const req = httpTestingController.expectOne(`${baseUrl}/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProjectsStatsDTO);
      expect(service.projectsStats()).toEqual(mockProjectsStatsDTO);
    });

    it('should log error to console on failure', () => {
      spyOn(console, 'error');

      service.loadProjectsStatus();

      const req = httpTestingController.expectOne(`${baseUrl}/stats`);
      req.flush('Server error', {status: 500, statusText: 'Internal Server Error'});
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadProjectStatus()', () => {
    it('should call GET /projects/stats/:id and update projectStats signal', () => {
      service.loadProjectStatus(id);

      const req = httpTestingController.expectOne(`${baseUrl}/stats/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProjectStatsDTO);
      expect(service.projectStats()).toEqual(mockProjectStatsDTO);
    });

    it('should log error to console on failure', () => {
      spyOn(console, 'error');
      service.loadProjectStatus(id);

      const req = httpTestingController.expectOne(`${baseUrl}/stats/${id}`);
      req.flush('Server error', {status: 500, statusText: 'Internal Server Error'});
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getProject()', () => {
    it('should call GET /projects/project/:id and return the project', () => {
      service.getProject(id).subscribe(res => expect(res).toEqual(mockGetResponseProjects.content[0]));

      const req = httpTestingController.expectOne(`${baseUrl}/project/${id}`);
      req.flush(mockGetResponseProjects.content[0]);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('addNewProject()', () => {
    it('should call POST /projects/new-project with the request body', () => {
      service.addNewProject(mockProjectRequest).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/new-project`);
      req.flush(mockGetResponseProjects.content[0]);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockProjectRequest);
    });

    it('should emit on projectChanged$ after a successful add', () => {
      let emitted: boolean = false;
      service.addNewProject(mockProjectRequest).subscribe();
      service.projectChanged$.subscribe(() => emitted = true);

      const req = httpTestingController.expectOne(`${baseUrl}/new-project`);
      req.flush(mockGetResponseProjects.content[0]);
      expect(emitted).toBeTrue();
    });
  });

  describe('updateProject()', () => {
    it('should call PUT /projects/update/:id with the request body', () => {
      service.updateProject(id, mockProjectRequest).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/update/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockProjectRequest);
      req.flush(mockGetResponseProjects.content[0]);
    });
  });

  describe('deleteProject()', () => {
    it('should call DELETE /projects/delete/:id', () => {
      service.deleteProject(id).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/delete/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('searchProjects()', () => {
    it('should call GET /projects/project/search/:keyword with correct params', () => {
      const keyword: string = 'project';

      service.searchProjects(keyword, partialParams).subscribe();

      const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/project/search/${keyword}`);
      req.flush(mockGetResponseProjects);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe(`${partialParams.page - 1}`);
      expect(req.request.params.get('size')).toBe(`${partialParams.size}`);
    });
  });

  describe('getOverdueProjects()', () => {
    it('should call GET /projects/p-overdue with correct page (page - 1) and size params', () => {
      service.getOverdueProjects(partialParams).subscribe();

      const req = httpTestingController.expectOne((request) => request.url === `${baseUrl}/p-overdue`);
      req.flush(mockGetResponseProjects);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe(`${partialParams.page - 1}`);
      expect(req.request.params.get('size')).toBe(`${partialParams.size}`);
    });
  });

  describe('Signal initial state', () => {
    it('should initialize projectsStats signal with zeroed values', () => {
      const expectedResult = {
        totalProjects: 0,
        completedProjects: 0,
        overdueProjects: 0,
      };
  
      expect(service.projectsStats()).toEqual(expectedResult);
    });
  
    it('should initialize projectStats signal with zeroed values', () => {
      const expectedResult = {
        totalTasks: 0,
        completedTasks: 0,
        tasksInProgress: 0,
        overdueTasks: 0,
      };

      expect(service.projectStats()).toEqual(expectedResult);
    });
  });

});
