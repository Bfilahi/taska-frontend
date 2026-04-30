import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsTable } from './projects-table';
import { provideZonelessChangeDetection } from '@angular/core';
import { GetResponseProjects, Project } from '../../../services/project';
import { NEVER, of, Subject, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Priority } from '../../../enum/priorityEnum';
import { Status } from '../../../enum/statusEnum';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

describe('ProjectsTable', () => {
  let component: ProjectsTable;
  let fixture: ComponentFixture<ProjectsTable>;

  let mockProjectService: jasmine.SpyObj<Project>;

  let projectSubject: Subject<void>;
  let mockGetResponseProjects: GetResponseProjects;

  beforeEach(async () => {
    projectSubject = new Subject<void>();

    mockProjectService = jasmine.createSpyObj(['getAllProjects'], {
      projectChanged$: projectSubject.asObservable()
    });

    mockProjectService.getAllProjects.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [ProjectsTable],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: Project, useValue: mockProjectService }
      ]
    })
    .compileComponents();

    mockGetResponseProjects = {
      content: [
        {
          id: 1,
          name: 'some project name',
          description: 'some project description',
          startDate: new Date(2025, 9, 3),
          dueDate: new Date(2025, 10, 12),
          priority: Priority.LOW,
          status: Status.ACTIVE,
          progress: 30,
        }
      ],
      page: {
        size: 3,
        number: 2,
        totalElements: 5,
        totalPages: 4,
      }
    }

    fixture = TestBed.createComponent(ProjectsTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call listProjects on ngOnInit', () => {
      spyOn<any>(component, 'listProjects');

      fixture.detectChanges();

      expect(component['listProjects']).toHaveBeenCalled();
    });

    it('should call listProjects when projectChanged$ emits', () => {
      spyOn<any>(component, 'listProjects');

      fixture.detectChanges();
      projectSubject.next();

      expect(component['listProjects']).toHaveBeenCalled();
    });
  });

  describe('listProjects - success', () => {
    it('should populate projects signal with response content', () => {
      mockProjectService.getAllProjects.and.returnValue(of(mockGetResponseProjects));

      fixture.detectChanges();

      expect(component.projects()).toEqual(mockGetResponseProjects.content);
    });
    
    it('should update partialParams from response page', () => {
      mockProjectService.getAllProjects.and.returnValue(of(mockGetResponseProjects));

      fixture.detectChanges();

      expect(component['partialParams'].page).toBe(mockGetResponseProjects.page.number + 1);
      expect(component['partialParams'].size).toBe(mockGetResponseProjects.page.size);
    });

    it('should set isLoading to false after successful response', () => {
      mockProjectService.getAllProjects.and.returnValue(of(mockGetResponseProjects));

      fixture.detectChanges();

      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('listProjects - error', () => {
    it('should set isLoading to false on HTTP error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500
      });
      mockProjectService.getAllProjects.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.isLoading()).toBeFalse();
    });
    it('should leave projects signal empty on HTTP error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500
      });
      mockProjectService.getAllProjects.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.projects()).toEqual([]);
    });
  });

  describe('Template', () => {
    it('should render a card for each project', () => {
      component.projects.set(mockGetResponseProjects.content);

      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.css('mat-card'));
      expect(cards.length).toBe(mockGetResponseProjects.content.length);
    });

    it('should display the correct name, description, dueDate and progress for each project', () => {
      component.projects.set(mockGetResponseProjects.content);
      const datePipe = new DatePipe('en-US');

      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.css('mat-card'));
      cards.forEach((card, index) => {
        const name = card.query(By.css('h3'));
        const description = card.query(By.css('p.subtext'));
        const dueDate = card.query(By.css('mat-icon + span'));
        const progress = card.query(By.css('span.progress'));

        expect(name.nativeElement.textContent.trim()).toBe(mockGetResponseProjects.content[index].name);
        expect(description.nativeElement.textContent.trim()).toBe(mockGetResponseProjects.content[index].description);
        expect(dueDate.nativeElement.textContent.trim()).toBe(
          datePipe.transform(mockGetResponseProjects.content[index].dueDate, 'MMM d, y'),
        );
        expect(progress.nativeElement.textContent.trim()).toBe(`${mockGetResponseProjects.content[index].progress}%`);
      })
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