import { TestBed } from '@angular/core/testing';

import { GetResponseTasks, Task } from './task';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment.development';
import { Priority } from '../enum/priorityEnum';
import { Status } from '../enum/statusEnum';
import { TaskResponse } from '../dto/taskResponse';
import { TaskRequest } from '../dto/taskRequest';

describe('Task', () => {
  let service: Task;

  const partialParams = { page: 1, size: 10 };
  const baseUrl: string = `${environment.BASE_URL}/tasks`;
  const projectId: number = 1;
  const taskId: number = 2;

  let httpTestingController: HttpTestingController;

  let mockGetResponseTasks: GetResponseTasks;
  let mockTaskResponse: TaskResponse;
  let mockTaskRequest: TaskRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    mockGetResponseTasks = {
      content: [
        {
          id: 1,
          title: 'some task title',
          description: 'some task description',
          priority: Priority.HIGH,
          status: Status.COMPLETED,
          dueDate: new Date(2025, 8, 9),
          projectId: 1,
          subtasks: 3,
        }
      ],
      page: {
        size: 4,
        number: 3,
        totalElements: 10,
        totalPages: 7,
      }
    };

    mockTaskResponse = {
      id: 1,
      title: 'some task title',
      description: 'some task description',
      priority: Priority.HIGH,
      status: Status.COMPLETED,
      dueDate: new Date(2025, 8, 9),
      projectId: 1,
      subtasks: 4,
    };
    
    mockTaskRequest = {
      title: 'some task title',
      description: 'some task description',
      priority: Priority.HIGH,
      status: Status.ACTIVE,
      dueDate: new Date(2024, 5, 9),
      projectId: 2,
    }

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(Task);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTasks()', () => {
    it('should call the correct URL with projectId', () => {
      service.getAllTasks(partialParams, projectId).subscribe();

      const req = httpTestingController.expectOne((request) => request.url === `${baseUrl}/${projectId}`);
      req.flush(mockGetResponseTasks);
      expect(req.request.method).toBe('GET');
    });

    it('should include page and size as query params', () => {
      service.getAllTasks(partialParams, projectId).subscribe();

      const req = httpTestingController.expectOne((request) => request.url === `${baseUrl}/${projectId}`);
      req.flush(mockGetResponseTasks);
      expect(req.request.params.get('page')).toBe((partialParams.page - 1).toString());
      expect(req.request.params.get('size')).toBe((partialParams.size).toString());
    });

    it('should return an observable of GetResponseTasks', () => {
      service.getAllTasks(partialParams, projectId).subscribe(res => expect(res).toEqual(mockGetResponseTasks));

      const req = httpTestingController.expectOne((request) => request.url === `${baseUrl}/${projectId}`);
      req.flush(mockGetResponseTasks);
    });

    it('should not emit on taskChanged$ after getAllTasks', () => {
      let emitted: boolean = false;

      service.getAllTasks(partialParams, projectId).subscribe(() => emitted = true);

      const req = httpTestingController.expectOne((request) => request.url === `${baseUrl}/${projectId}`);
      expect(emitted).toBeFalse();

      req.flush(mockGetResponseTasks);
      expect(emitted).toBeTrue();
    });
  });

  describe('getTask()', () => {
    it('should call the correct URL with taskId and projectId', () => {
      service.getTask(taskId, projectId).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/task/${taskId}?projectId=${projectId}`);
      req.flush(mockTaskResponse);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toContain(projectId);
    });

    it('should return an observable of TaskResponse', () => {
      service.getTask(taskId, projectId).subscribe(res => expect(res).toEqual(mockTaskResponse));

      const req = httpTestingController.expectOne(`${baseUrl}/task/${taskId}?projectId=${projectId}`);
      req.flush(mockTaskResponse);
    });

    it('should not emit on taskChanged$ after getTask', () => {
      let emitted: boolean = false;

      service.getTask(taskId, projectId).subscribe(() => emitted = true);

      const req = httpTestingController.expectOne(`${baseUrl}/task/${taskId}?projectId=${projectId}`);
      expect(emitted).toBeFalse();

      req.flush(mockGetResponseTasks);
      expect(emitted).toBeTrue();
    });
  });

  describe('getOverdueTasks()', () => {
    it('should call the correct URL with projectId', () => {
      service.getOverdueTasks(partialParams, projectId).subscribe();

      const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/t-overdue/${projectId}`);
      req.flush(mockGetResponseTasks);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toContain(projectId);
    });

    it('should include page and size as query params', () => {
      service.getOverdueTasks(partialParams, projectId).subscribe();

      const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/t-overdue/${projectId}`);
      req.flush(mockGetResponseTasks);
      expect(req.request.params.get('page')).toBe((partialParams.page - 1).toString());
      expect(req.request.params.get('size')).toBe((partialParams.size).toString());
    });

    it('should return an observable of GetResponseTasks', () => {
      service.getOverdueTasks(partialParams, projectId).subscribe(res => expect(res).toEqual(mockGetResponseTasks));

      const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/t-overdue/${projectId}`);
      req.flush(mockGetResponseTasks);
    });

    it('should not emit on taskChanged$ after getOverdueTasks', () => {
      let emitted: boolean = false;

      service.getOverdueTasks(partialParams, projectId).subscribe(() => emitted = true);

      const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/t-overdue/${projectId}`);
      expect(emitted).toBeFalse();

      req.flush(mockGetResponseTasks);
      expect(emitted).toBeTrue();
    });
  });

  describe('addNewTask()', () => {
    it('should call the correct URL with a POST request', () => {
      service.addNewTask(mockTaskRequest).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/new-task`);
      req.flush(mockTaskResponse);
      expect(req.request.method).toBe('POST');
    });

    it('should return an observable of TaskResponse', () => {
      service.addNewTask(mockTaskRequest).subscribe(res => expect(res).toEqual(mockTaskResponse));

      const req = httpTestingController.expectOne(`${baseUrl}/new-task`);
      req.flush(mockTaskResponse);
    });

    it('should notify taskChanged$ on success', () => {
      spyOn(service, 'notifyTaskChanged');
      service.addNewTask(mockTaskRequest).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/new-task`);
      req.flush(mockTaskResponse);
      expect(service.notifyTaskChanged).toHaveBeenCalled();
    });

    it('should not notify taskChanged$ on failure', () => {
      spyOn(service, 'notifyTaskChanged');
      service.addNewTask(mockTaskRequest).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      httpTestingController.expectOne(`${baseUrl}/new-task`)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
      expect(service.notifyTaskChanged).not.toHaveBeenCalled();
    });
  });

  describe('updateTask()', () => {
    it('should call the correct URL with taskId and a PUT request', () => {
      service.updateTask(taskId, mockTaskRequest).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/update/${taskId}`);
      req.flush(mockTaskResponse);
      expect(req.request.method).toBe('PUT')
      expect(req.request.body).toEqual(mockTaskRequest);
    });

    it('should return an observable of TaskResponse', () => {
      service.updateTask(taskId, mockTaskRequest).subscribe(res => expect(res).toEqual(mockTaskResponse));

      const req = httpTestingController.expectOne(`${baseUrl}/update/${taskId}`);
      req.flush(mockTaskResponse);
    });

    it('should notify taskChanged$ on success', () => {
      spyOn(service, 'notifyTaskChanged');
      service.updateTask(taskId, mockTaskRequest).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/update/${taskId}`);
      req.flush(mockTaskResponse);
      expect(service.notifyTaskChanged).toHaveBeenCalled();
    });

    it('should not notify taskChanged$ on failure', () => {
      spyOn(service, 'notifyTaskChanged');
      service.updateTask(taskId, mockTaskRequest).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      const req = httpTestingController.expectOne(`${baseUrl}/update/${taskId}`)
      .flush('Server error', {status: 500, statusText: 'Internal Server Error'});
    });
  });

  describe('deleteTask()', () => {
    it('should call the correct URL with taskId and projectId', () => {
      service.deleteTask(taskId, projectId).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/delete/${taskId}?projectId=${projectId}`);
      req.flush({});
      expect(req.request.method).toBe('DELETE');
      expect(req.request.url).toContain(taskId);
      expect(req.request.url).toContain(projectId);
    });

    it('should notify taskChanged$ on success', () => {
      spyOn(service, 'notifyTaskChanged');
      service.deleteTask(taskId, projectId).subscribe();

      const req = httpTestingController.expectOne(`${baseUrl}/delete/${taskId}?projectId=${projectId}`);
      req.flush({});
      expect(service.notifyTaskChanged).toHaveBeenCalled();
    });

    it('should not notify taskChanged$ on failure', () => {
      spyOn(service, 'notifyTaskChanged');
      service.deleteTask(taskId, projectId).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      const req = httpTestingController.expectOne(`${baseUrl}/delete/${taskId}?projectId=${projectId}`);
      req.flush('Server error', {status: 500, statusText: 'Internal Server Error'});
      expect(service.notifyTaskChanged).not.toHaveBeenCalled();
    });
  });

  describe('searchTasks()', () => {
    it('should call the correct URL with the keyword', () => {
      const keyword: string = 'task';
      service.searchTasks(keyword, partialParams).subscribe();

      const req = httpTestingController.expectOne(
        (request) => request.url === `${baseUrl}/task/search/${keyword}`,
      );
      req.flush(mockGetResponseTasks);
      expect(req.request.method).toBe('GET');
      expect(req.request.url).toContain(keyword);
    });

    it('should include page and size as query params', () => {
      const keyword: string = 'task';
      service.searchTasks(keyword, partialParams).subscribe();

      const req = httpTestingController.expectOne(
        (request) => request.url === `${baseUrl}/task/search/${keyword}`,
      );
      req.flush(mockGetResponseTasks);
      expect(req.request.params.get('page')).toBe(`${partialParams.page - 1}`);
      expect(req.request.params.get('size')).toBe(`${partialParams.size}`);
    });

    it('should return an observable of GetResponseTasks', () => {
      const keyword: string = 'task';
      service
        .searchTasks(keyword, partialParams)
        .subscribe((res) => expect(res).toEqual(mockGetResponseTasks));

      const req = httpTestingController.expectOne(
        (request) => request.url === `${baseUrl}/task/search/${keyword}`,
      );
      req.flush(mockGetResponseTasks);
    });

    it('should not emit on taskChanged$ after searchTasks', () => {
      const keyword: string = 'task';
      let emitted: boolean = false;

      service.searchTasks(keyword, partialParams).subscribe(() => emitted = true);

      const req = httpTestingController.expectOne((request) => request.url === `${baseUrl}/task/search/${keyword}`);
      expect(emitted).toBeFalse();

      req.flush(mockGetResponseTasks);
      expect(emitted).toBeTrue();
    });
  });

  describe('toggleTaskCompletion()', () => {
    it('should call the correct URL with taskId and projectId', () => {
      service.toggleTaskCompletion(taskId, projectId).subscribe();

      const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/toggle/${taskId}?projectId=${projectId}`);
      req.flush(mockTaskResponse);
      expect(req.request.method).toBe('POST');
    });

    it('should use a POST request with null body', () => {
      service.toggleTaskCompletion(taskId, projectId).subscribe();

      const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/toggle/${taskId}?projectId=${projectId}`);
      req.flush(mockTaskResponse);
      expect(req.request.body).toBeNull();
    });

    it('should return an observable of TaskResponse', () => {
      service.toggleTaskCompletion(taskId, projectId).subscribe(res => expect(res).toEqual(mockTaskResponse));

      const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/toggle/${taskId}?projectId=${projectId}`);
      req.flush(mockTaskResponse);
    });

    it('should notify taskChanged$ on success', () => {
      spyOn(service, 'notifyTaskChanged');
      service.toggleTaskCompletion(taskId, projectId).subscribe();

      const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/toggle/${taskId}?projectId=${projectId}`);
      req.flush(mockTaskResponse);
      expect(service.notifyTaskChanged).toHaveBeenCalled();
    });

    it('should not notify taskChanged$ on failure', () => {
      spyOn(service, 'notifyTaskChanged');
      service.toggleTaskCompletion(taskId, projectId).subscribe({
        next: () => fail('expected an error'),
        error: (err) => expect(err.status).toBe(500)
      });

      const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/toggle/${taskId}?projectId=${projectId}`);
      req.flush('Server error', {status: 500, statusText: 'Internal Server Error'});
      expect(service.notifyTaskChanged).not.toHaveBeenCalled();
    });
  });

  describe('notifyTaskChanged()', () => {
    it('should emit on taskChanged$ when called', () => {
      let emitted: boolean = false;

      service.taskChanged$.subscribe(() => emitted = true);
      service.notifyTaskChanged();
      expect(emitted).toBeTrue();
    });
  });

});
