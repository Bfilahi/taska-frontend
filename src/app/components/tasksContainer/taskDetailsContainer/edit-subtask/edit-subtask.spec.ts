import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSubtask } from './edit-subtask';
import { provideZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subtask } from '../../../../services/subtask';
import { HotToastService } from '@ngxpert/hot-toast';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { Status } from '../../../../enum/statusEnum';
import { SubtaskResponse } from '../../../../dto/subtaskResponse';
import { Priority } from '../../../../enum/priorityEnum';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('EditSubtask', () => {
  let component: EditSubtask;
  let fixture: ComponentFixture<EditSubtask>;

  let mockSubtaskService: jasmine.SpyObj<Subtask>;
  let dialogRef: MatDialogRef<EditSubtask>;
  let toaster: HotToastService;
  let route: { queryParamMap: Observable<ParamMap> };

  let mockSubtaskResponse: SubtaskResponse;

  beforeEach(async () => {
    mockSubtaskService = jasmine.createSpyObj(['updateSubtask', 'getSubtask']);
    dialogRef = jasmine.createSpyObj(['close']);
    route = { queryParamMap: of(convertToParamMap({t_id: '1'}))};

    mockSubtaskService.getSubtask.and.returnValue(NEVER);
    
    await TestBed.configureTestingModule({
      imports: [EditSubtask],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: route },
        { provide: Subtask, useValue: mockSubtaskService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

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
    fixture = TestBed.createComponent(EditSubtask);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should create the form with dueDate and status controls on ngOnInit', () => {
      fixture.detectChanges();

      expect(component.editSubtaskForm.get('dueDate')).toBeTruthy();
      expect(component.editSubtaskForm.get('status')).toBeTruthy();
    });

    it('should set status to Status.ACTIVE by default', () => {
      fixture.detectChanges();

      expect(component.editSubtaskForm.get('status')?.value).toBe(Status.ACTIVE);
    });

    it('should call getSubtask when a valid t_id query param is present', () => {
      spyOn<any>(component, 'getSubtask');

      fixture.detectChanges();

      expect(component['getSubtask']).toHaveBeenCalled();
    });

    it('should not call getSubtask when t_id is missing', () => {
      route.queryParamMap = of(convertToParamMap({t_id: 'a'}));
      spyOn<any>(component, 'getSubtask');

      fixture.detectChanges();

      expect(component['getSubtask']).not.toHaveBeenCalled();
    });
  });

  describe('Form Patching (effect)', () => {
    it('should patch dueDate and status on the main form when subtask signal is set', () => {
      component['subtask'].set(mockSubtaskResponse);

      fixture.detectChanges();

      expect(component.editSubtaskForm.get('dueDate')).toBeTruthy();
      expect(component.editSubtaskForm.get('status')).toBeTruthy();
    });
  });

  describe('Validation', () => {
    it('should be invalid when dueDate is empty', () => {
      fixture.detectChanges();

      const dueDate = component.editSubtaskForm.get('dueDate');
      dueDate?.patchValue('');

      expect(component.editSubtaskForm.invalid).toBeTrue();
    });

    it('should be invalid when status is empty', () => {
      fixture.detectChanges();
      
      const status = component.editSubtaskForm.get('status');
      status?.patchValue('');

      expect(component.editSubtaskForm.invalid).toBeTrue();
    });

    it('should be valid when both dueDate and status are provided', () => {
      fixture.detectChanges();

      const dueDate = component.editSubtaskForm.get('dueDate');
      dueDate?.patchValue(new Date(2026, 9, 8))
      const status = component.editSubtaskForm.get('status');
      status?.patchValue(Status.ACTIVE);

      expect(dueDate?.valid).toBeTrue();
      expect(status?.valid).toBeTrue();
    });
  });

  describe('onSubmit()', () => {
    it('should do nothing if the user cancels the confirmation dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      fixture.detectChanges();
      component.onSubmit();

      expect(mockSubtaskService.updateSubtask).not.toHaveBeenCalled();
    });

    it('should set isLoading to true while the request is in flight', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockSubtaskService.updateSubtask.and.returnValue(NEVER);
      
      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeTrue();
    });

    it('should set isLoading to false and show a success toast and close the dialog on success', () => {
      mockSubtaskService.updateSubtask.and.returnValue(of(mockSubtaskResponse));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'success');

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
      expect(toaster.success).toHaveBeenCalledWith('Subtask was updated successfully');
      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should set isLoading to false and show an error toast with the server message on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockSubtaskService.updateSubtask.and.returnValue(throwError(() => error));
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'error');

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });

    it('should log an error and show an error toast if reusableFields is missing', () => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(toaster, 'error');
      spyOn(console, 'error');
      component.editSubtaskForm.removeControl('reusableFields');

      component.onSubmit();

      expect(toaster.error).toHaveBeenCalledWith('Error: Form fields are missing');
      expect(console.error).toHaveBeenCalledWith('Error: Form fields are missing');
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

    it('should show the save icon when not loading', () => {
      component.isLoading.set(false);

      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('mat-icon[fontIcon="save"]'));
      expect(icon).toBeTruthy();
    });

    it('should show the spinner icon when loading', () => {
      component.isLoading.set(true);

      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('mat-icon[fontIcon="sync"]'));
      expect(icon).toBeTruthy();
    });
  });
});
