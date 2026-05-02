import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSubtask } from './new-subtask';
import { provideZonelessChangeDetection } from '@angular/core';
import { Subtask } from '../../../../services/subtask';
import { MatDialogRef } from '@angular/material/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { SubtaskRequest } from '../../../../dto/subtaskRequest';
import { FormControl, FormGroup } from '@angular/forms';
import { Priority } from '../../../../enum/priorityEnum';
import { SubtaskResponse } from '../../../../dto/subtaskResponse';
import { Status } from '../../../../enum/statusEnum';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('NewSubtask', () => {
  let component: NewSubtask;
  let fixture: ComponentFixture<NewSubtask>;

  let mockSubtaskService: jasmine.SpyObj<Subtask>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<NewSubtask>>;
  let toaster: HotToastService;
  let route: { queryParamMap: Observable<ParamMap> };

  let mockSubtaskResponse: SubtaskResponse;

  beforeEach(async () => {
    mockSubtaskService = jasmine.createSpyObj(['addNewSubtask']);
    dialogRef = jasmine.createSpyObj(['close']);
    route = { queryParamMap: of(convertToParamMap({t_id: '1'}))};

    await TestBed.configureTestingModule({
      imports: [NewSubtask],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Subtask, useValue: mockSubtaskService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: ActivatedRoute, useValue: route }
      ]
    })
    .compileComponents();

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
    fixture = TestBed.createComponent(NewSubtask);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize the form with a null dueDate control', () => {
      fixture.detectChanges();

      expect(component.newSubtaskForm.get('dueDate')?.value).toBeNull();
    });

    it('should set taskId from the t_id query parameter on init', () => {
      fixture.detectChanges();

      expect(component['taskId']()).toBe(1);
    });

    it('should have an invalid form on initialization', () => {
      fixture.detectChanges();

      expect(component.newSubtaskForm.invalid).toBeTrue();
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when dueDate is empty', () => {
      const dueDate = component.newSubtaskForm.get('dueDate');
      dueDate?.patchValue('');

      fixture.detectChanges();

      expect(dueDate?.valid).toBeFalse();
    });

    it('should be invalid when dueDate is today', () => {
      const dueDate = component.newSubtaskForm.get('dueDate');
      dueDate?.patchValue(new Date());

      fixture.detectChanges();

      expect(dueDate?.valid).toBeFalse();
    });

    it('should be invalid when dueDate is in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dueDate = component.newSubtaskForm.get('dueDate');
      dueDate?.patchValue(yesterday);

      fixture.detectChanges();

      expect(dueDate?.valid).toBeFalse();
    });

    it('should be valid when dueDate is in the future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dueDate = component.newSubtaskForm.get('dueDate');
      dueDate?.patchValue(tomorrow);

      fixture.detectChanges();

      expect(dueDate?.valid).toBeTrue();
    });
  });

  describe('onSubmit() - success', () => {
    let request: SubtaskRequest;

    beforeEach(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dueDate = component.newSubtaskForm.get('dueDate');
      dueDate?.patchValue(tomorrow);

      const reusableFields = new FormGroup({
        name: new FormControl('some name'),
        description: new FormControl('some description'),
        priority: new FormControl(Priority.HIGH),
      });
      component.newSubtaskForm.addControl('reusableFields', reusableFields);
      request = {
        title: 'some name',
        description: 'some description',
        priority: Priority.HIGH,
        dueDate: tomorrow,
        taskId: 1,
      };

      fixture.detectChanges();
    });

    it('should set isLoading to true when form is submitted', () => {
      mockSubtaskService.addNewSubtask.and.returnValue(NEVER);

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeTrue();
    });

    it('should call subtaskService.addNewSubtask with the correct payload', () => {
      mockSubtaskService.addNewSubtask.and.returnValue(of(mockSubtaskResponse));

      component.onSubmit();

      expect(mockSubtaskService.addNewSubtask).toHaveBeenCalledWith(request);
    });

    it('should set isLoading to false on successful submission', () => {
      mockSubtaskService.addNewSubtask.and.returnValue(of(mockSubtaskResponse));

      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should close the dialog on successful submission', () => {
      mockSubtaskService.addNewSubtask.and.returnValue(of(mockSubtaskResponse));

      component.onSubmit();

      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should show a success toast on successful submission', () => {
      mockSubtaskService.addNewSubtask.and.returnValue(of(mockSubtaskResponse));
      spyOn(toaster, 'success');

      component.onSubmit();

      expect(toaster.success).toHaveBeenCalledWith('New subtask was added successfully');
    });
  });

  describe('onSubmit() - error', () => {
    let error: HttpErrorResponse;

    beforeEach(() => {
      error = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockSubtaskService.addNewSubtask.and.returnValue(throwError(() => error));

      fixture.detectChanges();
    });

    it('should set isLoading to false on HTTP error', () => {
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should show an error toast with the error message on HTTP error', () => {
      spyOn(toaster, 'error');

      component.onSubmit();

      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });

    it('should not call the service if reusableFields is missing', () => {
      component.newSubtaskForm.removeControl('reusableFields');

      component.onSubmit();

      expect(mockSubtaskService.addNewSubtask).not.toHaveBeenCalled();
    });

    it('should not call the service if taskId is falsy', () => {
      route.queryParamMap = of(convertToParamMap({t_id: null}));

      component.ngOnInit();
      component.onSubmit();

      expect(mockSubtaskService.addNewSubtask).not.toHaveBeenCalled();
    });

    it('should set isLoading to false if reusableFields is missing', () => {
      component.newSubtaskForm.removeControl('reusableFields');

      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });
    
    it('should show a fallback error toast if reusableFields is missing', () => {
      component.newSubtaskForm.removeControl('reusableFields');
      spyOn(toaster, 'error');

      component.onSubmit();

      expect(toaster.error).toHaveBeenCalledWith('Error: Form fields are missing');
    });
  });

  describe('Template', () => {
    it('should disable the submit button when the form is invalid', () => {
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('mat-dialog-actions button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should disable the submit button while isLoading is true', () => {
      component.isLoading.set(true);

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('mat-dialog-actions button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });
  });
});