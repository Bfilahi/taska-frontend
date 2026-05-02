import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTask } from './edit-task';
import { provideZonelessChangeDetection } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task } from '../../../services/task';
import { TaskResponse } from '../../../dto/taskResponse';
import { Priority } from '../../../enum/priorityEnum';
import { Status } from '../../../enum/statusEnum';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';


describe('EditTask', () => {
  let component: EditTask;
  let fixture: ComponentFixture<EditTask>;

  let mockTaskService: jasmine.SpyObj<Task>;
  let dialogRef: MatDialogRef<EditTask>;
  let toaster: HotToastService;
  let route: { queryParamMap: Observable<ParamMap> };

  let mockTaskResponse: TaskResponse;
  

  beforeEach(async () => {
    mockTaskService = jasmine.createSpyObj(['updateTask', 'getTask']);
    dialogRef = jasmine.createSpyObj(['close']);
    route = { queryParamMap: of(convertToParamMap({id: '1'}))};

    mockTaskService.getTask.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [EditTask],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: route },
        { provide: Task, useValue: mockTaskService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
    }).compileComponents();

    mockTaskResponse = {
      id: 1,
      title: 'task title',
      description: 'task description',
      priority: Priority.LOW,
      status: Status.ACTIVE,
      dueDate: new Date(2025, 8, 9),
      projectId: 2,
      subtasks: 1,
    }

    toaster = TestBed.inject(HotToastService);
    fixture = TestBed.createComponent(EditTask);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call getTask when projectId is present and task is null', () => {
      spyOn<any>(component, 'getTask');

      fixture.detectChanges();

      expect(component['getTask']).toHaveBeenCalled();
    });

    it('should not call getTask if task is already set', () => {
      component['task'].set(mockTaskResponse);
      spyOn<any>(component, 'getTask');

      fixture.detectChanges();

      expect(component['getTask']).not.toHaveBeenCalled();
    });
  });

  describe('Data Patching', () => {
    it('should patch editTaskForm with dueDate and status when task signal is set', () => {
      component['task'].set(mockTaskResponse);

      fixture.detectChanges();

      expect(component.editTaskForm.get('dueDate')).toBeTruthy();
      expect(component.editTaskForm.get('status')).toBeTruthy();
    });
  });
  
  describe('Form Validation', () => {
    it('should disable the submit button when editTaskForm is invalid', () => {
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('mat-dialog-actions button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });
  });

  describe('onSubmit()', () => {
    it('should do nothing if the user cancels the confirm dialog', () => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(false);
      mockTaskService.updateTask.and.returnValue(of(mockTaskResponse));

      component.onSubmit();

      expect(mockTaskService.updateTask).not.toHaveBeenCalled();
    });

    it('should set isLoading to true while the request is in flight', () => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
      mockTaskService.updateTask.and.returnValue(NEVER);

      component.onSubmit();

      expect(component.isLoading()).toBeTrue();
    });

    it('should set isLoading to false, show a success toast and close the dialog with true on success', () => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'success');
      mockTaskService.updateTask.and.returnValue(of(mockTaskResponse));

      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
      expect(toaster.success).toHaveBeenCalledWith('Task was updated successfully');
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should set isLoading to false, log the error and show an error toast on failure', () => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'error');
      spyOn(console, 'error');
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockTaskService.updateTask.and.returnValue(throwError(() => error));

      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
      expect(console.error).toHaveBeenCalledWith(error);
    });

    it('should log an error, reset isLoading and show an error toast if reusableFields is null', () => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'error');
      spyOn(console, 'error');
      component.editTaskForm.removeControl('reusableFields');

      component.onSubmit();

      expect(console.error).toHaveBeenCalledWith('Error: Form fields are missing');
      expect(toaster.error).toHaveBeenCalledWith('Error: Form fields are missing');
      expect(component.isLoading()).toBeFalse();
    });
  });
});
