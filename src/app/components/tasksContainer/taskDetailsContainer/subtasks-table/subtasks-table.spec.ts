import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtasksTable } from './subtasks-table';
import { provideZonelessChangeDetection } from '@angular/core';
import { GetResponseSubtasks, Subtask } from '../../../../services/subtask';
import { HotToastService } from '@ngxpert/hot-toast';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter } from '@angular/router';
import { Priority } from '../../../../enum/priorityEnum';
import { Status } from '../../../../enum/statusEnum';
import { HttpErrorResponse } from '@angular/common/http';
import { SubtaskResponse } from '../../../../dto/subtaskResponse';
import { PageEvent } from '@angular/material/paginator';
import { EditSubtask } from '../edit-subtask/edit-subtask';

describe('SubtasksTable', () => {
  let component: SubtasksTable;
  let fixture: ComponentFixture<SubtasksTable>;

  let mockSubtaskService: jasmine.SpyObj<Subtask>;
  let toaster: HotToastService;
  let dialog: jasmine.SpyObj<MatDialog>;

  let route: { queryParamMap: Observable<ParamMap> };
  let subtaskSubject: Subject<void>;
  let mockGetResponseSubtasks: GetResponseSubtasks;
  let mockSubtaskResponse: SubtaskResponse;

  const t_id: number = 2;

  beforeEach(async () => {
    subtaskSubject = new Subject<void>();

    mockSubtaskService = jasmine.createSpyObj(
      ['getSubTasks', 'deleteSubtask', 'toggleSubtaskCompletion'],
      {
        subtaskChanged$: subtaskSubject.asObservable(),
      },
    );
    dialog = jasmine.createSpyObj(['open']);

    route = {queryParamMap: of(convertToParamMap({t_id}))};

    mockSubtaskService.getSubTasks.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [SubtasksTable],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: Subtask, useValue: mockSubtaskService },
        { provide: ActivatedRoute, useValue: route }
      ]
    })
    .overrideComponent(SubtasksTable, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog }
        ]
      }
    })
    .compileComponents();

    mockGetResponseSubtasks = {
      content: 
      [{
        id: 1,
        title: 'task title',
        description: 'task description',
        priority: Priority.LOW,
        status: Status.ACTIVE,
        dueDate: new Date(2025, 8, 9),
        projectId: 2,
        subtasks: 1,
        }],
      page: {
        size: 10,
        number: 3,
        totalElements: 20,
        totalPages: 5
        }
    };

    mockSubtaskResponse = {
      id: 1,
      title: 'subtask title',
      description: 'subtask description',
      priority: Priority.HIGH,
      status: Status.ACTIVE,
      dueDate: new Date(2025, 9, 8),
      taskId: 2,
    };

    toaster = TestBed.inject(HotToastService);
    fixture = TestBed.createComponent(SubtasksTable);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should read t_id from query params and call listSubtasks on init', () => {
      spyOn<any>(component, 'listSubtasks');

      fixture.detectChanges();

      expect(component['listSubtasks']).toHaveBeenCalled();
    });

    it('should not call listSubtasks if t_id is missing', () => {
      route.queryParamMap = of(convertToParamMap({}));
      spyOn<any>(component, 'listSubtasks');

      fixture.detectChanges();

      expect(component['listSubtasks']).not.toHaveBeenCalled();
    });
  });

  describe('listSubtasks', () => {
    it('should set isLoading to true before fetching', () => {
      fixture.detectChanges();

      expect(component.isLoading()).toBeTrue();
    });

    it('should map response correctly to subtasks and pagination fields', () => {
      mockSubtaskService.getSubTasks.and.returnValue(of(mockGetResponseSubtasks));

      fixture.detectChanges();

      expect(component.partialParams.page).toEqual(mockGetResponseSubtasks.page.number + 1);
      expect(component.partialParams.size).toEqual(mockGetResponseSubtasks.page.size);
      expect(component.totalElements()).toEqual(mockGetResponseSubtasks.page.totalElements);
      expect(component.totalPages()).toEqual(mockGetResponseSubtasks.page.totalPages);
    });

    it('should set isLoading to false on fetch error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({status: 500});
      mockSubtaskService.getSubTasks.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('onDelete', () => {
    const id: number = 1;

    it('should do nothing if user cancels the confirm dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      mockSubtaskService.deleteSubtask.and.returnValue(NEVER);

      component.onDelete(id);

      expect(mockSubtaskService.deleteSubtask).not.toHaveBeenCalled();
    });

    it('should call deleteSubtask with correct subtaskId and taskId', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockSubtaskService.deleteSubtask.and.returnValue(of(void 0));

      fixture.detectChanges();
      component.onDelete(id);

      expect(mockSubtaskService.deleteSubtask).toHaveBeenCalledWith(id, t_id);
    });

    it('should show success toast on successful delete', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'success');
      mockSubtaskService.deleteSubtask.and.returnValue(of(void 0));

      component.onDelete(id);

      expect(toaster.success).toHaveBeenCalledWith('Task was deleted successfully');
    });

    it('should show error toast on delete failure', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'error');
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockSubtaskService.deleteSubtask.and.returnValue(throwError(() => error));

      component.onDelete(id);

      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });
  });

  describe('toggleSubtaskCompletion', () => {
    const id: number = 1;

    it('should call toggleSubtaskCompletion with correct taskId and subtaskId', () => {
      mockSubtaskService.toggleSubtaskCompletion.and.returnValue(of());

      fixture.detectChanges();
      component.toggleSubtaskCompletion(id);

      expect(mockSubtaskService.toggleSubtaskCompletion).toHaveBeenCalledWith(t_id, id);
    });

    it('should set isLoading false after toggling', () => {
      mockSubtaskService.toggleSubtaskCompletion.and.returnValue(of(mockSubtaskResponse));

      component.toggleSubtaskCompletion(id);

      expect(component.isLoading()).toBeFalse();
    });

    it('should set isLoading to false on toggle error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({status: 500});
      mockSubtaskService.toggleSubtaskCompletion.and.returnValue(throwError(() => error));

      component.toggleSubtaskCompletion(id);

      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('onPageChange', () => {
    const event: PageEvent = {
      pageIndex: 2,
      pageSize: 3,
      length: 2,
    };

    it('should update partialParams page as pageIndex + 1', () => {
      component.onPageChange(event);

      expect(component.partialParams.page).toBe(event.pageIndex + 1);
    });

    it('should update partialParams size from page event', () => {
      component.onPageChange(event);

      expect(component.partialParams.size).toBe(event.pageSize);
    });

    it('should call listSubtasks after page change', () => {
      spyOn<any>(component, 'listSubtasks');

      component.onPageChange(event);

      expect(component['listSubtasks']).toHaveBeenCalled();
    });
  });

  describe('openEditTaskDialog', () => {
    it('should open EditSubtask dialog with correct subtaskId', () => {
      const id: number = 1;
      const dialogConfig: MatDialogConfig = {
        data: { subtaskId: id }
      }

      component.openEditTaskDialog(id);

      expect(dialog.open).toHaveBeenCalledWith(EditSubtask, dialogConfig);
    });
  });

});