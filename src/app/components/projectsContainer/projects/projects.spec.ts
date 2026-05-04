import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Projects } from './projects';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GetResponseProjects, Project } from '../../../services/project';
import { NEVER, of, Subject, throwError } from 'rxjs';
import { Priority } from '../../../enum/priorityEnum';
import { Status } from '../../../enum/statusEnum';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { NewProject } from '../new-project/new-project';
import { By } from '@angular/platform-browser';

describe('Projects', () => {
  let component: Projects;
  let fixture: ComponentFixture<Projects>;

  let dialog: jasmine.SpyObj<MatDialog>;
  let mockProjectService: jasmine.SpyObj<Project>;

  let projectSubject: Subject<void>;
  let mockGetResponseProjects: GetResponseProjects;

  beforeEach(async () => {
    projectSubject = new Subject<void>();

    mockProjectService = jasmine.createSpyObj(['getAllProjects', 'searchProjects'], {
      projectChanged$: projectSubject.asObservable(),
    });
    dialog = jasmine.createSpyObj(['open']);

    mockProjectService.getAllProjects.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [Projects],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: Project, useValue: mockProjectService }
      ]
    })
    .overrideComponent(Projects, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog }
        ]
      }
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

    fixture = TestBed.createComponent(Projects);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call getProjects on ngOnInit', () => {
      spyOn<any>(component, 'getProjects');

      fixture.detectChanges();

      expect(component['getProjects']).toHaveBeenCalled();
    });

    it('should initialize signals with correct default values', () => {
      mockProjectService.getAllProjects.and.returnValue(of(mockGetResponseProjects));
      
      fixture.detectChanges();

      expect(component.projects()).toEqual(mockGetResponseProjects.content);
    });
  });

  describe('search()', () => {
      let input: HTMLInputElement;

      beforeEach(() => {
        input = document.createElement('input');
        input.value = 'some value';
      });

    it('should set isFilterOn to true when search is called', () => {
      mockProjectService.searchProjects.and.returnValue(NEVER);

      component.search(input);

      expect(component.isFilterOn()).toBeTrue();
    });

    it('should set isFilterOn to false when search input is empty', () => {
      input.value = '';

      component.search(input);

      expect(component.isFilterOn()).toBeFalse();
    });

    it('should set isFilterOn to false when search input is whitespace only', () => {
      input.value = '     ';

      component.search(input);

      expect(component.isFilterOn()).toBeFalse();
    });

    it('should reset page and size to defaults before searching', () => {
      mockProjectService.searchProjects.and.returnValue(NEVER);

      component.search(input);

      expect(component.partialParams.page).toBe(1);
      expect(component.partialParams.size).toBe(5);
    });

    it('should clear projects and set isSearchLoading to true before API call', () => {
      mockProjectService.searchProjects.and.returnValue(NEVER);

      component.search(input);

      expect(component.projects()).toEqual([]);
      expect(component.isSearchLoading()).toBeTrue();
    });

    it('should populate projects and update pagination signals on search success', () => {
      mockProjectService.searchProjects.and.returnValue(of(mockGetResponseProjects));

      component.search(input);

      expect(component.projects()).toEqual(mockGetResponseProjects.content);
      expect(component.partialParams.page).toBe(mockGetResponseProjects.page.number + 1);
      expect(component.partialParams.size).toBe(mockGetResponseProjects.page.size);
      expect(component.totalElements()).toBe(mockGetResponseProjects.page.totalElements);
      expect(component.totalPages()).toBe(mockGetResponseProjects.page.totalPages);
    });

    it('should set isSearchLoading to false on search success', () => {
      mockProjectService.searchProjects.and.returnValue(of(mockGetResponseProjects));

      component.search(input);

      expect(component.isSearchLoading()).toBeFalse();
    });
    
    it('should set isSearchLoading to false on search error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({status: 500});
      mockProjectService.searchProjects.and.returnValue(throwError(() => error))

      component.search(input);

      expect(component.isSearchLoading()).toBeFalse();
    });
  });

  describe('reset()', () => {
    it('should set isFilterOn to false when reset is called', () => {
      component.reset();

      expect(component.isFilterOn()).toBeFalse();
    });

    it('should reset page and size to defaults when reset is called', () => {
      component.reset();

      expect(component.partialParams.page).toBe(1);
      expect(component.partialParams.size).toBe(5);
    });

    it('should call getProjects when reset is called', () => {
      spyOn<any>(component, 'getProjects');

      component.reset();

      expect(component['getProjects']).toHaveBeenCalled();
    });
  });

  describe('onPageChange()', () => {
    const event: PageEvent = {
      pageIndex: 2,
      pageSize: 3,
      length: 2,
    };

    it('should convert pageIndex to 1-based page number', () => {
      component.onPageChange(event);

      expect(component.partialParams.page).toBe(event.pageIndex + 1);
    });

    it('should update size from the page event', () => {
      component.onPageChange(event);

      expect(component.partialParams.size).toBe(event.pageSize);
    });

    it('should call getProjects when page changes', () => {
      spyOn<any>(component, 'getProjects');

      component.onPageChange(event);

      expect(component['getProjects']).toHaveBeenCalled();
    });
  });

  describe('getProjects()', () => {
    it('should set isLoading to true before fetching projects', () => {
      component['getProjects']();

      expect(component.isLoading()).toBeTrue();
    });

    it('should set projects and update pagination signals on success', () => {
      mockProjectService.getAllProjects.and.returnValue(of(mockGetResponseProjects));

      component['getProjects']();

      expect(component.projects()).toEqual(mockGetResponseProjects.content);
      expect(component.partialParams.page).toBe(mockGetResponseProjects.page.number + 1);
      expect(component.partialParams.size).toBe(mockGetResponseProjects.page.size);
      expect(component.totalElements()).toBe(mockGetResponseProjects.page.totalElements);
      expect(component.totalPages()).toBe(mockGetResponseProjects.page.totalPages);
    });

    it('should set isLoading to false on success', () => {
      mockProjectService.getAllProjects.and.returnValue(of(mockGetResponseProjects));

      component['getProjects']();

      expect(component.isLoading()).toBeFalse();
    });

    it('should set isLoading to false on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({status: 500});
      mockProjectService.getAllProjects.and.returnValue(throwError(() => error));

      component['getProjects']();

      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('openNewProjectDialog()', () => {
    it('should open NewProject dialog when openNewProjectDialog is called', () => {
      component.openNewProjectDialog();

      expect(dialog.open).toHaveBeenCalledWith(NewProject);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should complete destroy$ on ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Template', () => {
    it('should disable the All button when isFilterOn is false', () => {
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('button.text-sm'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should apply active background to All button when isFilterOn is true', () => {
      component.isFilterOn.set(true);

      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('button.text-sm'));
      expect(btn.nativeElement.style.background).toBe('var(--mat-sys-primary-fixed-dim)');
    });

    it('should call search with the input element when the form is submitted', () => {
      spyOn(component, 'search');

      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input')).nativeElement;
      const btn = fixture.debugElement.query(By.css('form'));
      btn.triggerEventHandler('ngSubmit', null);

      expect(component.search).toHaveBeenCalledWith(input);
    });
  });
});