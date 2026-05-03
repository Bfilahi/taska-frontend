import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProject } from './new-project';
import { provideZonelessChangeDetection } from '@angular/core';
import { Project } from '../../../services/project';
import { HotToastService } from '@ngxpert/hot-toast';
import { MatDialogRef } from '@angular/material/dialog';
import { NEVER, of, Subject, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ProjectResponse } from '../../../dto/projectResponse';
import { Priority } from '../../../enum/priorityEnum';
import { Status } from '../../../enum/statusEnum';
import { HttpErrorResponse } from '@angular/common/http';

describe('AddProject', () => {
  let component: NewProject;
  let fixture: ComponentFixture<NewProject>;

  let mockProjectService: jasmine.SpyObj<Project>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<NewProject>>;
  let toaster: HotToastService;

  let projectSubject: Subject<void>;
  let mockProjectResponse: ProjectResponse;

  beforeEach(async () => {
    projectSubject = new Subject<void>();

    mockProjectService = jasmine.createSpyObj(['addNewProject', 'loadProjectsStatus'], {
      projectChanged$: projectSubject.asObservable()
    });
    dialogRef = jasmine.createSpyObj(['close']);

    await TestBed.configureTestingModule({
      imports: [NewProject],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Project, useValue: mockProjectService },
        { provide: MatDialogRef, useValue: dialogRef }
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

    toaster = TestBed.inject(HotToastService);
    fixture = TestBed.createComponent(NewProject);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should be invalid when dueDate is empty', () => {
      const dueDate = component.newProjectForm.get('dueDate');
      dueDate?.patchValue(null);

      fixture.detectChanges();

      expect(component.newProjectForm.invalid).toBeTrue();
    });

    it('should show required error when dueDate is touched and empty', () => {
      const dueDate = component.newProjectForm.get('dueDate');
      dueDate?.markAsTouched();
      dueDate?.markAsDirty();

      fixture.detectChanges();

      expect(dueDate?.errors?.['required']).toBeTruthy();
    });

    it('should be invalid when dueDate is today', () => {
      const dueDate = component.newProjectForm.get('dueDate');
      dueDate?.patchValue(new Date());

      fixture.detectChanges();

      expect(dueDate?.invalid).toBeTrue();
    });

    it('should be invalid when dueDate is in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dueDate = component.newProjectForm.get('dueDate');
      dueDate?.patchValue(yesterday);

      fixture.detectChanges();

      expect(dueDate?.invalid).toBeTrue();
    });
    
    it('should be valid when dueDate is a future date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dueDate = component.newProjectForm.get('dueDate');
      dueDate?.patchValue(tomorrow);

      fixture.detectChanges();

      expect(dueDate?.invalid).toBeFalse();
    });

    it('should disable submit button when form is invalid', () => {
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('mat-dialog-actions button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });
  });

  describe('onSubmit()', () => {
    it('should set isLoading to true when form is submitted', () => {
      mockProjectService.addNewProject.and.returnValue(NEVER);

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeTrue();
    });

    it('should set isLoading to false on successful submission', () => {
      mockProjectService.addNewProject.and.returnValue(of(mockProjectResponse));

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should reset the form on successful submission', () => {
      mockProjectService.addNewProject.and.returnValue(of(mockProjectResponse));
      spyOn(component.newProjectForm, 'reset');

      fixture.detectChanges();
      component.onSubmit();

      expect(component.newProjectForm.reset).toHaveBeenCalled();
    });

    it('should close the dialog on successful submission', () => {
      mockProjectService.addNewProject.and.returnValue(of(mockProjectResponse));

      fixture.detectChanges();
      component.onSubmit();

      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should show success toast on successful submission', () => {
      mockProjectService.addNewProject.and.returnValue(of(mockProjectResponse));
      spyOn(toaster, 'success');

      fixture.detectChanges();
      component.onSubmit();

      expect(toaster.success).toHaveBeenCalledWith('New project was added successfully');
    });

    it('should call loadProjectsStatus on successful submission', () => {
      mockProjectService.addNewProject.and.returnValue(of(mockProjectResponse));

      fixture.detectChanges();
      component.onSubmit();

      expect(mockProjectService.loadProjectsStatus).toHaveBeenCalled();
    });

    it('should set isLoading to false on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProjectService.addNewProject.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component.onSubmit();

      expect(component.isLoading()).toBeFalse();
    });

    it('should show error toast with server message on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      mockProjectService.addNewProject.and.returnValue(throwError(() => error));
      spyOn(toaster, 'error');

      fixture.detectChanges();
      component.onSubmit();

      expect(toaster.error).toHaveBeenCalledWith(`Error: ${error.error.message}`);
    });
  });

  describe('Loading state', () => {
    it('should initialize isLoading as false', () => {
      fixture.detectChanges();

      expect(component.isLoading()).toBeFalse();
    });

    it('should disable submit button while isLoading is true', () => {
      component.isLoading.set(true);

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('mat-dialog-actions button'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });
  });

  describe('Lifecycle', () => {
    it('should call loadProjectsStatus when projectChanged$ emits', () => {
      fixture.detectChanges();

      projectSubject.next();

      expect(mockProjectService.loadProjectsStatus).toHaveBeenCalled();
    });

    it('should unsubscribe from projectChanged$ on destroy', () => {
      fixture.detectChanges();
      
      component.ngOnDestroy();
      projectSubject.next();

      expect(mockProjectService.loadProjectsStatus).toHaveBeenCalledTimes(0);
    });
  });
});
