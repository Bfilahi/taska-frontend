import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSettings } from './project-settings';
import { provideZonelessChangeDetection } from '@angular/core';
import { Project } from '../../../../services/project';
import { GetResponseTasks, Task } from '../../../../services/task';
import { HotToastService } from '@ngxpert/hot-toast';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { ControlContainer } from '@angular/forms';
import { ProjectResponse } from '../../../../dto/projectResponse';
import { Priority } from '../../../../enum/priorityEnum';
import { Status } from '../../../../enum/statusEnum';
import { HttpErrorResponse } from '@angular/common/http';
import { ProjectRequest } from '../../../../dto/projectRequest';
import { PageEvent } from '@angular/material/paginator';
import { By } from '@angular/platform-browser';


describe('ProjectSettings', () => {
  let component: ProjectSettings;
  let fixture: ComponentFixture<ProjectSettings>;

  let parentContainer: jasmine.SpyObj<ControlContainer>;
  let mockProjectService: jasmine.SpyObj<Project>;
  let mockTaskService: jasmine.SpyObj<Task>;
  let toaster: HotToastService;
  let route: { queryParamMap: Observable<ParamMap> };
  let router: Router;

  let taskSubject: Subject<void>;
  let mockProjectResponse: ProjectResponse;
  let mockGetResponseTasks: GetResponseTasks;  
  

  beforeEach(async () => {
    taskSubject = new Subject<void>();

    mockProjectService = jasmine.createSpyObj(['getProject', 'updateProject', 'deleteProject']);
    mockTaskService = jasmine.createSpyObj(['getOverdueTasks'], {taskChanged$: taskSubject.asObservable()});
    parentContainer = jasmine.createSpyObj(['']);

    route = { queryParamMap: of(convertToParamMap({id: '1'})) };

    mockProjectService.getProject.and.returnValue(NEVER);
    mockTaskService.getOverdueTasks.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [ProjectSettings],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Project, useValue: mockProjectService },
        { provide: Task, useValue: mockTaskService },
        { provide: ActivatedRoute, useValue: route },
        { provide: ControlContainer, useValue: parentContainer }
      ]
    })
    .compileComponents();

    mockProjectResponse = {
      id: 1,
      name: 'project name',
      description: 'project description',
      startDate: new Date(2025, 8, 9),
      dueDate: new Date(2025, 10, 3),
      priority: Priority.HIGH,
      status: Status.ACTIVE,
      progress: 40,
    }

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
        },
      ],
      page:{
        size: 4,
        number: 3,
        totalElements: 10,
        totalPages: 7,
      }
    };

    router = TestBed.inject(Router);
    toaster = TestBed.inject(HotToastService);
    fixture = TestBed.createComponent(ProjectSettings);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should fetch the project when id query param is present', () => {
      mockProjectService.getProject.and.returnValue(of(mockProjectResponse));

      fixture.detectChanges();

      expect(component.project()).toEqual(mockProjectResponse);
    });

    it('should not fetch the project when id query param is absent', () => {
      route.queryParamMap = of(convertToParamMap({}));

      fixture.detectChanges();

      expect(mockProjectService.getProject).not.toHaveBeenCalled();
    });

    it('should call getOverdueTasks on init', () => {
      spyOn<any>(component, 'getOverdueTasks');

      fixture.detectChanges();

      expect(component['getOverdueTasks']).toHaveBeenCalled();
    });
  });

  describe('Form Patching', () => {
    it('should patch form fields when project signal updates', () => {
      component.project.set(mockProjectResponse);

      fixture.detectChanges();

      expect(component.projectForm.get('dueDate')).toBeTruthy();
      expect(component.projectForm.get('status')).toBeTruthy();
    });
    
    it('should patch reusableFields when project signal updates', () => {
      fixture.detectChanges();

      component.project.set(mockProjectResponse);
      component.projectForm.addControl('reusableFields', null);

      fixture.detectChanges();

      expect(component.projectForm.get('reusableFields')?.get('name')?.value).toBe(mockProjectResponse.name);
      expect(component.projectForm.get('reusableFields')?.get('description')?.value).toBe(mockProjectResponse.description);
      expect(component.projectForm.get('reusableFields')?.get('priority')?.value).toBe(mockProjectResponse.priority);
    });
  });

  describe('onSubmit()', () => {
    it('should do nothing if user cancels the confirm dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should set isLoading to true while the request is in flight', () => {
      mockProjectService.updateProject.and.returnValue(NEVER);
      spyOn(window, 'confirm').and.returnValue(true);

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeTrue();
    });

    it('should set isLoading to false after the request succeeds', () => {
      mockProjectService.updateProject.and.returnValue(of(mockProjectResponse));
      spyOn(window, 'confirm').and.returnValue(true);

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should set isLoading to false after the request fails', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProjectService.updateProject.and.returnValue(throwError(() => error));
      spyOn(window, 'confirm').and.returnValue(true);

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should call updateProject with the correct project ID and request', () => { 
      fixture.detectChanges();

      const request: ProjectRequest = {
        name: mockProjectResponse.name,
        description: mockProjectResponse.description,
        dueDate: mockProjectResponse.dueDate,
        priority: mockProjectResponse.priority,
        status: mockProjectResponse.status,
      };
      component.project.set(mockProjectResponse);
      mockProjectService.updateProject.and.returnValue(NEVER);
      spyOn(window, 'confirm').and.returnValue(true);

      fixture.detectChanges();
      component.onSubmit();

      expect(mockProjectService.updateProject).toHaveBeenCalledWith(1, request);
    });

    it('should show a success toast on successful update', () => {
      mockProjectService.updateProject.and.returnValue(of(mockProjectResponse));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'success');

      fixture.detectChanges();
      component.onSubmit();

      expect(toaster.success).toHaveBeenCalledWith('Project was updated successfully');
    });

    it('should show an error toast with the error message on failed update', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({ 
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProjectService.updateProject.and.returnValue(throwError(() => error));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'error');

      fixture.detectChanges();
      component.onSubmit();

      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });

    it('should show an error toast if reusableFields is missing', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'error');
      fixture.detectChanges();

      component.projectForm.removeControl('reusableFields');
      component.onSubmit();

      expect(toaster.error).toHaveBeenCalledWith('Error: Form fields are missing');
    });
  });

  describe('onDelete()', () => {
    it('should do nothing if user cancels the confirm dialog on delete', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      fixture.detectChanges();
      component.onDelete();

      expect(component.isDeleteLoading()).toBeFalse();
    });

    it('should set isDeleteLoading to true while the request is in flight', () => {
      mockProjectService.deleteProject.and.returnValue(NEVER);
      spyOn(window, 'confirm').and.returnValue(true);

      fixture.detectChanges();
      component.onDelete();

      expect(component.isDeleteLoading()).toBeTrue();
    });

    it('should set isDeleteLoading to false after the request succeeds', () => {
      mockProjectService.deleteProject.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);

      fixture.detectChanges();
      component.onDelete();

      expect(component.isDeleteLoading()).toBeFalse();
    });

    it('should set isDeleteLoading to false after the request fails', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({ 
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProjectService.deleteProject.and.returnValue(throwError(() => error));
      spyOn(window, 'confirm').and.returnValue(true);

      fixture.detectChanges();
      component.onDelete();

      expect(component.isDeleteLoading()).toBeFalse();
    });

    it('should call deleteProject with the correct project ID', () => {
      mockProjectService.deleteProject.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);

      fixture.detectChanges();
      component.onDelete();

      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(1);
    });

    it('should navigate to / on successful delete', () => {
      mockProjectService.deleteProject.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(router, 'navigate');

      fixture.detectChanges();
      component.onDelete();
      
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should show a success toast on successful delete', () => {
      mockProjectService.deleteProject.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'success');

      fixture.detectChanges();
      component.onDelete();

      expect(toaster.success).toHaveBeenCalledWith('Project was deleted successfully');
    });

    it('should show an error toast on failed delete', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({ 
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProjectService.deleteProject.and.returnValue(throwError(() => error));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'error');

      fixture.detectChanges();
      component.onDelete();

      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });
  });

  describe('Pagination', () => {
    it('should update partialParams page and size on page change', () => {
      const event: PageEvent = {
        pageIndex: 2,
        pageSize: 3,
        length: 2,
      };

      fixture.detectChanges();
      component.onPageChange(event);

      expect(component.partialParams.page).toBe(event.pageIndex + 1);
      expect(component.partialParams.size).toBe(event.pageSize);
    });

    it('should call getOverdueTasks after page change', () => {
      const event: PageEvent = {
        pageIndex: 2,
        pageSize: 3,
        length: 2,
      };
      spyOn<any>(component, 'getOverdueTasks');

      fixture.detectChanges();
      component.onPageChange(event);

      expect(component['getOverdueTasks']).toHaveBeenCalled();
    });

    it('should update totalElements signal from the response', () => {
      mockTaskService.getOverdueTasks.and.returnValue(of(mockGetResponseTasks));

      fixture.detectChanges();
      component['getOverdueTasks']();

      expect(component.partialParams.page).toBe(mockGetResponseTasks.page.number + 1);
      expect(component.partialParams.size).toBe(mockGetResponseTasks.page.size);
      expect(component.totalElements()).toBe(mockGetResponseTasks.page.totalElements);
    });

    it('should update totalPages signal from the response', () => {
      mockTaskService.getOverdueTasks.and.returnValue(of(mockGetResponseTasks));

      fixture.detectChanges();
      component['getOverdueTasks']();

      expect(component.totalPages()).toBe(mockGetResponseTasks.page.totalPages);
    });

    it('should log an error when getOverdueTasks fails', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({status: 500});
      mockTaskService.getOverdueTasks.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      fixture.detectChanges();
      component['getOverdueTasks']();

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('Overdue Tasks Subscription', () => {
    it('should unsubscribe from taskChanged$ on destroy', () => {
      fixture.detectChanges();

      const callsBefore = mockProjectService.getProject.calls.count();
      taskSubject.next();
      component.ngOnDestroy();

      expect(mockProjectService.getProject.calls.count()).toBe(callsBefore);
    });
  });

  describe('Template', () => {
    it('should hide the paginator when overdueTasks is empty', () => {
      fixture.detectChanges();

      const paragraph = fixture.debugElement.query(By.css('.empty'));
      expect(paragraph).toBeTruthy();
    });

    it('should show the paginator when overdueTasks is not empty', () => {
      component.overdueTasks.set(mockGetResponseTasks.content);

      fixture.detectChanges();

      const paginator = fixture.debugElement.query(By.css('mat-paginator'));
      expect(paginator).toBeTruthy();
    });
  });
});