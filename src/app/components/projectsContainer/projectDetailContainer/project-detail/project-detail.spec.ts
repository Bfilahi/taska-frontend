import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetail } from './project-detail';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { Project } from '../../../../services/project';
import { Task } from '../../../../services/task';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProjectResponse } from '../../../../dto/projectResponse';
import { Priority } from '../../../../enum/priorityEnum';
import { Status } from '../../../../enum/statusEnum';
import { NewTask } from '../../../tasksContainer/new-task/new-task';
import { ProjectStatsDTO } from '../../../../dto/projectStatsDTO';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';


describe('ProjectDetail', () => {
  let component: ProjectDetail;
  let fixture: ComponentFixture<ProjectDetail>;

  let mockProjectService: jasmine.SpyObj<Project>;
  let mockTaskService: jasmine.SpyObj<Task>;
  let dialog: jasmine.SpyObj<MatDialog>;

  let route: { queryParamMap: Observable<ParamMap> };

  let taskSubject: Subject<void>;
  let mockProjectResponse: ProjectResponse;

  let mockProjectStatsDTO: ProjectStatsDTO;

  beforeEach(async () => {
    taskSubject = new Subject<void>();

    mockProjectStatsDTO = {
      totalTasks: 7,
      completedTasks: 5,
      tasksInProgress: 1,
      overdueTasks: 1
    };

    mockProjectService = jasmine.createSpyObj(['loadProjectStatus', 'getProject'], {
      projectStats: signal<ProjectStatsDTO>(mockProjectStatsDTO)
    });
    mockTaskService = jasmine.createSpyObj(['getOverdueTasks', 'getAllTasks'], {
      taskChanged$: taskSubject.asObservable(),
    });
    dialog = jasmine.createSpyObj(['open']);

    route = { queryParamMap: of(convertToParamMap({id: '1'})) };

    mockTaskService.getOverdueTasks.and.returnValue(NEVER);
    mockTaskService.getAllTasks.and.returnValue(NEVER);
    mockProjectService.getProject.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [ProjectDetail],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: Project, useValue: mockProjectService },
        { provide: Task, useValue: mockTaskService },
        { provide: ActivatedRoute, useValue: route }
      ]
    })
    .overrideComponent(ProjectDetail, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog }
        ]
      }
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

    fixture = TestBed.createComponent(ProjectDetail);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call loadProjectStatus with the correct project ID on init', () => {
      fixture.detectChanges();

      expect(mockProjectService.loadProjectStatus).toHaveBeenCalledWith(1);
    });

    it('should not call loadProjectStatus when id param is missing', () => {
      route.queryParamMap = of(convertToParamMap({}));

      fixture.detectChanges();

      expect(mockProjectService.loadProjectStatus).not.toHaveBeenCalled();
    });

    it('should reload the project when taskChanged$ emits', () => {
      mockProjectService.getProject.and.returnValue(of(mockProjectResponse));

      fixture.detectChanges();
      taskSubject.next();

      expect(mockProjectService.getProject).toHaveBeenCalled();
    });
  });

  describe('openNewTaskDialog()', () => {
    it('should open the NewTask dialog', () => {
      dialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
      fixture.detectChanges();

      component.openNewTaskDialog();

      expect(dialog.open).toHaveBeenCalledWith(NewTask);
    });

    it('should call loadProjectStatus after dialog closes with a truthy response', () => {
      dialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
      fixture.detectChanges();

      component.openNewTaskDialog();

      expect(mockProjectService.loadProjectStatus).toHaveBeenCalled();
    });
  });

  describe('cards computed signal', () => {
    it('should return 4 cards', () => {
      fixture.detectChanges();

      expect(component.cards().length).toBe(4);
    });

    it('should reflect the correct amounts from projectStats()', () => {
      mockProjectService.projectStats.set(mockProjectStatsDTO);

      fixture.detectChanges();

      expect(component.cards()[0].amount).toEqual(mockProjectStatsDTO.totalTasks);
      expect(component.cards()[1].amount).toEqual(mockProjectStatsDTO.completedTasks);
      expect(component.cards()[2].amount).toEqual(mockProjectStatsDTO.tasksInProgress);
      expect(component.cards()[3].amount).toEqual(mockProjectStatsDTO.overdueTasks);
    });
  });

  describe('Template', () => {
    it('should render the project name', () => {
      component.project.set(mockProjectResponse);

      fixture.detectChanges();

      const h2 = fixture.debugElement.query(By.css('h2'));
      expect(h2.nativeElement.textContent.trim()).toBe(mockProjectResponse.name);
    });

    it('should call openNewTaskDialog when the New Task button is clicked', () => {
      spyOn(component, 'openNewTaskDialog');

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('button'));
      btn.triggerEventHandler('click', null);
      expect(component.openNewTaskDialog).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should log the error when getProject fails', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProjectService.getProject.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      fixture.detectChanges();
      component['getProject']();

      expect(console.error).toHaveBeenCalledWith(error);
    });

    it('should keep project signal as null when getProject fails', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      mockProjectService.getProject.and.returnValue(throwError(() => error));

      fixture.detectChanges();
      component['getProject']();

      expect(component.project()).toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from taskChanged$ on destroy', () => {
      mockProjectService.getProject.and.returnValue(of(mockProjectResponse));
      fixture.detectChanges();
      
      const callsBefore = mockProjectService.getProject.calls.count();
      component.ngOnDestroy();
      taskSubject.next();

      expect(mockProjectService.getProject.calls.count()).toBe(callsBefore);
    });
  });
});