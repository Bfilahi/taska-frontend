import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTask } from './new-task';
import { provideZonelessChangeDetection } from '@angular/core';
import { Task } from '../../../services/task';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup } from '@angular/forms';
import { Priority } from '../../../enum/priorityEnum';
import { TaskResponse } from '../../../dto/taskResponse';
import { Status } from '../../../enum/statusEnum';
import { TaskRequest } from '../../../dto/taskRequest';
import { HttpErrorResponse } from '@angular/common/http';

describe('NewTask', () => {
  let component: NewTask;
  let fixture: ComponentFixture<NewTask>;

  let mockTaskService: jasmine.SpyObj<Task>;
  let route: { queryParamMap: Observable<ParamMap> };
  let dialogRef: jasmine.SpyObj<MatDialogRef<NewTask>>;
  let toaster: HotToastService;

  let mockTaskResponse: TaskResponse;

  beforeEach(async () => {
    mockTaskService = jasmine.createSpyObj(['addNewTask']);
    dialogRef = jasmine.createSpyObj(['close']);
    route = { queryParamMap: of(convertToParamMap({id: '1'})) };

    await TestBed.configureTestingModule({
      imports: [NewTask],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Task, useValue: mockTaskService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: ActivatedRoute, useValue: route }
      ]
    })
    .compileComponents();

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
    fixture = TestBed.createComponent(NewTask);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should parse projectId from query params on init', () => {
      fixture.detectChanges();

      expect(component['projectId']()).toBe(1);
    });

    it('should initialize the form with dueDate as null', () => {
      fixture.detectChanges();

      expect(component.newTaskForm.get('dueDate')?.value).toBeNull();
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when dueDate is empty', () => {
      fixture.detectChanges();

      expect(component.newTaskForm.invalid).toBeTrue();
    });

    it('should be invalid when dueDate is today', () => {
      component.newTaskForm.get('dueDate')?.patchValue(new Date());

      fixture.detectChanges();

      expect(component.newTaskForm.invalid).toBeTrue();
    });

    it('should be invalid when dueDate is in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      component.newTaskForm.get('dueDate')?.patchValue(yesterday);

      fixture.detectChanges();

      expect(component.newTaskForm.invalid).toBeTrue();
    });

    it('should be valid when dueDate is a future date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      component.newTaskForm.get('dueDate')?.patchValue(tomorrow);

      fixture.detectChanges();

      expect(component.newTaskForm.get('dueDate')?.valid).toBeTrue();
    });

    it('should disable the submit button when form is invalid', () => {
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('mat-dialog-actions button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should disable the submit button when isLoading is true', () => {  
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);    

      const reusableFields = new FormGroup({
        name: new FormControl('some name'),
        description: new FormControl('some description'),
        priority: new FormControl(Priority.HIGH),
      });
      component.newTaskForm.addControl('reusableFields', reusableFields );
      component.newTaskForm.get('dueDate')?.patchValue(tomorrow);
      component.isLoading.set(true);

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('mat-dialog-actions button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });
  });

  describe('onSubmit()  - success', () => {
    let request: TaskRequest;

    beforeEach(() => {
      mockTaskService.addNewTask.and.returnValue(of(mockTaskResponse));

      const reusableFields = new FormGroup({
        name: new FormControl('some name'),
        description: new FormControl('some description'),
        priority: new FormControl(Priority.HIGH),
      });
      component.newTaskForm.addControl('reusableFields', reusableFields);
  
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      component.newTaskForm.get('dueDate')?.patchValue(tomorrow);
  
      request = {
        title: 'some name',
        description: 'some description',
        priority: Priority.HIGH,
        dueDate: tomorrow,
        projectId: 1,
      };

      fixture.detectChanges();
    });
    
    it('should set isLoading to true on submission', () => {
      mockTaskService.addNewTask.and.returnValue(NEVER);

      component.onSubmit();

      expect(component.isLoading()).toBeTrue();
    });

    it('should call addNewTask with correctly shaped TaskRequest', () => {
      component.onSubmit();

      expect(mockTaskService.addNewTask).toHaveBeenCalledWith(request);
    });

    it('should set isLoading to false on success', () => {
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should close the dialog with true on success', () => {
      component.onSubmit();

      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should show a success toast on success', () => {
      spyOn(toaster, 'success');

      component.onSubmit();

      expect(toaster.success).toHaveBeenCalledWith('New task was added successfully');
    });
  });

  describe('onSubmit() - error', () => {
    describe('when reusableFields is null', () => {
      it('should reset isLoading if reusableFields is null', () => {
        fixture.detectChanges();
        component.newTaskForm.removeControl('reusableFields');
        component.onSubmit();

        expect(component.isLoading()).toBeFalse();
      });

      it('should show an error toast if reusableFields is null', () => {
        spyOn(toaster, 'error');

        fixture.detectChanges();
        component.newTaskForm.removeControl('reusableFields');
        component.onSubmit();

        expect(toaster.error).toHaveBeenCalledWith('Error: Form fields are missing');
      });

      it('should close the dialog with false if reusableFields is null', () => {
        fixture.detectChanges();
        component.newTaskForm.removeControl('reusableFields');
        component.onSubmit();

        expect(dialogRef.close).toHaveBeenCalledWith(false);
      });
    });

    describe('when HTTP error occurs', () => {
      beforeEach(() => {
        const error = new HttpErrorResponse({
          status: 500,
          error: { message: 'Something went wrong' },
        });
        mockTaskService.addNewTask.and.returnValue(throwError(() => error));

        const reusableFields = new FormGroup({
          name: new FormControl('some name'),
          description: new FormControl('some description'),
          priority: new FormControl(Priority.HIGH),
        });
        component.newTaskForm.addControl('reusableFields', reusableFields);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        component.newTaskForm.get('dueDate')?.patchValue(tomorrow);

        fixture.detectChanges();
      });

      it('should reset isLoading on HTTP error', () => {
        component.onSubmit();
        expect(component.isLoading()).toBeFalse();
      });

      it('should show an error toast with the server message on HTTP error', () => {
        spyOn(toaster, 'error');
        component.onSubmit();
        expect(toaster.error).toHaveBeenCalledWith('Error: Something went wrong');
      });

      it('should close the dialog with false on HTTP error', () => {
        component.onSubmit();
        expect(dialogRef.close).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Template', () => {
    it('should show the add_circle icon when not loading', () => {
      component.isLoading.set(false);

      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css("[fontIcon = 'add_circle']"));
      expect(icon).toBeTruthy();
    });

    it('should show the spinning sync icon when loading', () => {
      component.isLoading.set(true);

      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css("[fontIcon = 'sync']"));
      expect(icon).toBeTruthy();
    });

    it('should close the dialog when the close button is clicked', () => {
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.directive(MatDialogClose));
      btn.triggerEventHandler('click', new MouseEvent('click'));
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });
});
