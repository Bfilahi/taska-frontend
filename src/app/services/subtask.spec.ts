import { TestBed } from '@angular/core/testing';

import { GetResponseSubtasks, Subtask } from './subtask';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Priority } from '../enum/priorityEnum';
import { Status } from '../enum/statusEnum';
import { SubtaskResponse } from '../dto/subtaskResponse';
import { SubtaskRequest } from '../dto/subtaskRequest';

describe('Subtask', () => {
  let service: Subtask;

  const id: number = 1;
  const partialParams = { page: 1, size: 10 };
  const baseUrl: string = `${environment.BASE_URL}/subtasks`;
  const taskId: number = 2;
  const subtaskId: number = 1;

  let mockGetResponseSubtasks: GetResponseSubtasks;
  let mockSubtaskResponse: SubtaskResponse;
  let mockSubtaskRequest: SubtaskRequest;

  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ]
    });

    mockGetResponseSubtasks = {
      content: [
        {
          id: 1,
          title: 'some task title',
          description: 'some task description',
          priority: Priority.HIGH,
          status: Status.ACTIVE,
          dueDate: new Date(2025, 10, 7),
          projectId: 1,
          subtasks: 2,
        }
      ],
      page: {
        size: 3,
        number: 2,
        totalElements: 7,
        totalPages: 2,
      }
    };

    mockSubtaskResponse = {
      id: 1,
      title: 'some subtask',
      description: 'some subtask description',
      priority: Priority.LOW,
      status: Status.ACTIVE,
      dueDate: new Date(2025, 4, 10),
      taskId: 1,
    };

    mockSubtaskRequest = {
      title: 'some subtask title',
      description: 'some subtask description',
      priority: Priority.MEDIUM,
      status: Status.ACTIVE,
      dueDate: new Date(2025, 9, 2),
      taskId: 1,
    }

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(Subtask);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the correct URL for getSubTasks()', () => {
    service.getSubTasks(id, partialParams).subscribe();

    const req = httpTestingController.expectOne((request) => request.url === `${baseUrl}/${id}/subtasks`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe((partialParams.page - 1).toString());
    expect(req.request.params.get('size')).toBe((partialParams.size).toString());
    req.flush(mockGetResponseSubtasks);
  });

  it('should call the correct URL for getSubtask()', () => {
    service.getSubtask(taskId, subtaskId).subscribe();

    const req = httpTestingController.expectOne(`${baseUrl}/subtask/${subtaskId}?taskId=${taskId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSubtaskResponse);
  });

  it('should call the correct URL for addNewSubtask()', () => {
    spyOn<any>(service, 'notifySubtaskChanged');

    service.addNewSubtask(mockSubtaskRequest).subscribe();

    const req = httpTestingController.expectOne(`${baseUrl}/new-subtask`);
    req.flush(mockSubtaskResponse);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSubtaskRequest);
    expect(service['notifySubtaskChanged']).toHaveBeenCalled();
  });

  it('should call the correct URL for updateSubtask()', () => {
    spyOn<any>(service, 'notifySubtaskChanged');

    service.updateSubtask(id, mockSubtaskRequest).subscribe();

    const req = httpTestingController.expectOne(`${baseUrl}/${id}`);
    req.flush(mockSubtaskResponse);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockSubtaskRequest);
    expect(service['notifySubtaskChanged']).toHaveBeenCalled();
  });

  it('should call the correct URL for deleteSubtask()', () => {
    spyOn<any>(service, 'notifySubtaskChanged');

    service.deleteSubtask(subtaskId, taskId).subscribe();

    const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/${subtaskId}`);
    req.flush({});
    expect(req.request.method).toBe('DELETE');
    expect(req.request.params.get('taskId')).toBe(taskId.toString());
    expect(service['notifySubtaskChanged']).toHaveBeenCalled();
  });

  it('should call the correct URL for toggleSubtaskCompletion()', () => {
    spyOn<any>(service, 'notifySubtaskChanged');

    service.toggleSubtaskCompletion(taskId, subtaskId).subscribe();

    const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/toggle/${subtaskId}?taskId=${taskId}`);
    req.flush(mockSubtaskResponse);
    expect(req.request.method).toBe('POST');
    expect(service['notifySubtaskChanged']).toHaveBeenCalled();
  });

  it('should make subtaskChanged$ emit after addNewSubtask complete successfully', () => {
    let emitted: boolean = false;

    service.subtaskChanged$.subscribe(() => emitted = true);
    service.addNewSubtask(mockSubtaskRequest).subscribe();

    const req = httpTestingController.expectOne(`${baseUrl}/new-subtask`);
    expect(emitted).toBeFalse();

    req.flush(mockSubtaskResponse);
    expect(emitted).toBeTrue();
  });

  it('should make subtaskChanged$ emit after updateSubtask complete successfully', () => {
    let emitted: boolean = false;

    service.subtaskChanged$.subscribe(() => emitted = true);
    service.updateSubtask(id, mockSubtaskRequest).subscribe();

    const req = httpTestingController.expectOne(`${baseUrl}/${id}`);
    expect(emitted).toBeFalse();

    req.flush(mockSubtaskResponse);
    expect(emitted).toBeTrue();
  });
  
  it('should make subtaskChanged$ emit after deleteSubtask complete successfully', () => {
    let emitted: boolean = false;

    service.subtaskChanged$.subscribe(() => emitted = true);
    service.deleteSubtask(subtaskId, taskId).subscribe();

    const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/${subtaskId}`);
    expect(emitted).toBeFalse();

    req.flush({});
    expect(emitted).toBeTrue();
  });

  it('should make subtaskChanged$ emit after toggleSubtaskCompletion complete successfully', () => {
    let emitted: boolean = false;

    service.subtaskChanged$.subscribe(() => emitted = true);
    service.toggleSubtaskCompletion(taskId, subtaskId).subscribe();

    const req = httpTestingController.expectOne(request => request.url === `${baseUrl}/toggle/${subtaskId}?taskId=${taskId}`);
    expect(emitted).toBeFalse();

    req.flush(mockSubtaskResponse);
    expect(emitted).toBeTrue();
  });

});
