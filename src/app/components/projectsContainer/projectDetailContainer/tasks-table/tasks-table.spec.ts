import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksTable } from './tasks-table';
import { provideZonelessChangeDetection } from '@angular/core';
import { GetResponseTasks, Task } from '../../../../services/task';
import { Project } from '../../../../services/project';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { Priority } from '../../../../enum/priorityEnum';
import { Status } from '../../../../enum/statusEnum';
import { HttpErrorResponse } from '@angular/common/http';
import { EditTask } from '../../../tasksContainer/edit-task/edit-task';
import { PageEvent } from '@angular/material/paginator';

describe('TasksTable', () => {
  let component: TasksTable;
  let fixture: ComponentFixture<TasksTable>;

  let mockTaskService: jasmine.SpyObj<Task>;
  let mockProjectService: jasmine.SpyObj<Project>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let toaster: HotToastService;
  let route: {queryParamMap: Observable<ParamMap>};

  let taskSubject: Subject<void>;

  let mockGetResponseTasks: GetResponseTasks;  
  

  beforeEach(async () => {
    taskSubject = new Subject<void>();

    mockTaskService = jasmine.createSpyObj(
      ['getAllTasks', 'toggleTaskCompletion', 'getAllTasks', 'deleteTask'],
      {
        taskChanged$: taskSubject.asObservable(),
      },
    );
    mockProjectService = jasmine.createSpyObj(['loadProjectStatus']);
    dialog = jasmine.createSpyObj(['open']);
    route = {queryParamMap: of(convertToParamMap({id: '1'}))};

    mockTaskService.getAllTasks.and.returnValue(NEVER);
    mockProjectService.loadProjectStatus.and.returnValue(void 0);

    await TestBed.configureTestingModule({
      imports: [TasksTable],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Task, useValue: mockTaskService },
        { provide: Project, useValue: mockProjectService },
        { provide: ActivatedRoute, useValue: route }
      ]
    })
    .overrideComponent(TasksTable, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog }
        ]
      }
    })
    .compileComponents();

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

    toaster = TestBed.inject(HotToastService);
    fixture = TestBed.createComponent(TasksTable);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should read id query param and set projectId correctly', () => {
      fixture.detectChanges();

      expect(component['projectId']()).toBe(1);
    });

    it('should call listTasks() on init when id param exists', () => {
      spyOn(component, 'listTasks');
      
      fixture.detectChanges();

      expect(component.listTasks).toHaveBeenCalled();
    });

    it('should not call listTasks() when id param is absent', () => {
      route.queryParamMap = of(convertToParamMap({}));
      spyOn(component, 'listTasks');

      fixture.detectChanges();

      expect(component.listTasks).not.toHaveBeenCalled();
    });

    it('should reload tasks and project status when taskChanged$ emits', () => {
      fixture.detectChanges();

      taskSubject.next();

      expect(mockProjectService.loadProjectStatus).toHaveBeenCalled();
    });
  });

  describe('listTasks()', () => {
    it('should set isLoading to true before fetching tasks', () => {
      fixture.detectChanges();

      component.listTasks();

      expect(component.isLoading()).toBeTrue();
    });

    it('should map response fields to signals correctly', () => {
      mockTaskService.getAllTasks.and.returnValue(of(mockGetResponseTasks));

      fixture.detectChanges();
      component.listTasks();

      expect(component.tasks()).toEqual(mockGetResponseTasks.content);
    });

    it('should store page number as response.page.number + 1', () => {
      mockTaskService.getAllTasks.and.returnValue(of(mockGetResponseTasks));

      fixture.detectChanges();
      component.listTasks();

      expect(component.partialParams.page).toBe(mockGetResponseTasks.page.number + 1);
    });

    it('should set isLoading to false on success', () => {
      mockTaskService.getAllTasks.and.returnValue(of(mockGetResponseTasks));

      fixture.detectChanges();
      component.listTasks();

      expect(component.isLoading()).toBeFalse();
    });

    it('should set isLoading to false on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockTaskService.getAllTasks.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.listTasks();

      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('onDelete()', () => {
    const taskId: number = 2;

    it('should do nothing if user cancels the confirm dialog', () => {
      mockTaskService.deleteTask.and.returnValue(of(void 0));
      spyOn(window, 'confirm').and.returnValue(false);

      fixture.detectChanges();
      component.onDelete(taskId);

      expect(mockTaskService.deleteTask).not.toHaveBeenCalled();
    });

    it('should call deleteTask with correct taskId and projectId', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockTaskService.deleteTask.and.returnValue(of(void 0));

      fixture.detectChanges();
      component.onDelete(taskId);

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId, 1);
    });

    it('should show success toast on successful deletion', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'success');
      mockTaskService.deleteTask.and.returnValue(of(void 0));

      fixture.detectChanges();
      component.onDelete(taskId);

      expect(toaster.success).toHaveBeenCalledWith('Task was deleted successfully');
    });

    it('should show error toast with message on deletion failure', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'error');
      mockTaskService.deleteTask.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.onDelete(taskId);

      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });

    it('should set isLoading to false on deletion success', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockTaskService.deleteTask.and.returnValue(of(void 0));

      fixture.detectChanges();
      component.onDelete(taskId);

      expect(component.isLoading()).toBeFalse();
    });

    it('should set isLoading to false on deletion error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      spyOn(window, 'confirm').and.returnValue(true);
      mockTaskService.deleteTask.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.onDelete(taskId);

      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('toggleTaskCompletion()', () => {
    const taskId: number = 2;

    it('should call toggleTaskCompletion with correct taskId and projectId', () => {
      mockTaskService.toggleTaskCompletion.and.returnValue(of(mockGetResponseTasks.content[0]));

      fixture.detectChanges();
      component.toggleTaskCompletion(taskId);

      expect(mockTaskService.toggleTaskCompletion).toHaveBeenCalledWith(taskId, 1);
    });

    it('should set isLoading to false on toggle success', () => {
      mockTaskService.toggleTaskCompletion.and.returnValue(of(mockGetResponseTasks.content[0]));

      fixture.detectChanges();
      component.toggleTaskCompletion(taskId);

      expect(component.isLoading()).toBeFalse();
    });

    it('should set isLoading to false on toggle error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockTaskService.toggleTaskCompletion.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.toggleTaskCompletion(taskId);

      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('openNewTaskDialog()', () => {
    const id: number = 2;

    it('should open EditTask dialog with the correct taskId in data', () => {
      const dialogConfig: MatDialogConfig = {
        data: {
          taskId: id,
        },
      };

      fixture.detectChanges();
      component.openNewTaskDialog(id);

      expect(dialog.open).toHaveBeenCalledWith(EditTask, dialogConfig);
    });
  });

  describe('onPageChange()', () => {
    it('should update partialParams.page as event.pageIndex + 1', () => {
      const event: PageEvent = {
        pageIndex: 2,
        pageSize: 3,
        length: 2,
      };

      fixture.detectChanges();
      component.onPageChange(event);

      expect(component.partialParams.page).toBe(event.pageIndex + 1);
    });

    it('should update partialParams.size from the event', () => {
      const event: PageEvent = {
        pageIndex: 2,
        pageSize: 3,
        length: 2,
      };

      fixture.detectChanges();
      component.onPageChange(event);

      expect(component.partialParams.size).toBe(event.pageSize);
    });

    it('should call listTasks() after updating params', () => {
      const event: PageEvent = {
        pageIndex: 2,
        pageSize: 3,
        length: 2,
      };
      spyOn(component, 'listTasks');

      fixture.detectChanges();
      component.onPageChange(event);

      expect(component.listTasks).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should complete destroy$ on ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});