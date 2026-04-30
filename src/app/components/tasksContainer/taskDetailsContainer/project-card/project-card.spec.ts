import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCard } from './project-card';
import { provideZonelessChangeDetection } from '@angular/core';
import { Project } from '../../../../services/project';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter } from '@angular/router';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { ProjectResponse } from '../../../../dto/projectResponse';
import { Priority } from '../../../../enum/priorityEnum';
import { Status } from '../../../../enum/statusEnum';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('ProjectCard', () => {
  let component: ProjectCard;
  let fixture: ComponentFixture<ProjectCard>;

  let mockProjectService: jasmine.SpyObj<Project>;
  let mockProjectResponse: ProjectResponse;

  let routeStub: {queryParamMap: Observable<ParamMap>};

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj(['getProject']);

    mockProjectService.getProject.and.returnValue(NEVER);

    routeStub = {
      queryParamMap: of(convertToParamMap({ p_id: 1 }))
    };

    await TestBed.configureTestingModule({
      imports: [ProjectCard],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: Project, useValue: mockProjectService },
        { provide: ActivatedRoute, useValue: routeStub }
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

    fixture = TestBed.createComponent(ProjectCard);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getProject with parsed id when p_id param is present', () => {
      spyOn<any>(component, 'getProject');

      fixture.detectChanges();

      expect(component['getProject']).toHaveBeenCalled();
    });

    it('should not call getProject when p_id param is missing', () => {
      routeStub.queryParamMap = of(convertToParamMap({}));
      spyOn<any>(component, 'getProject');

      fixture.detectChanges();

      expect(component['getProject']).not.toHaveBeenCalled();
    });

    it('should not call getProject when p_id param is NaN', () => {
      routeStub.queryParamMap = of(convertToParamMap({p_id: 'ab'}));
      spyOn<any>(component, 'getProject');

      fixture.detectChanges();

      expect(component['getProject']).not.toHaveBeenCalled();
    });
  });

  describe('getProject', () => {
    it('should set project signal with response on success', () => {
      mockProjectService.getProject.and.returnValue(of(mockProjectResponse));

      fixture.detectChanges();

      expect(component.project()).toEqual(mockProjectResponse);
    });

    it('should log error and leave project signal null on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({status: 500});
      mockProjectService.getProject.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.project()).toBeNull();
    });
  });

  describe('Template', () => {
    it('should render project name and start date', () => {
      component.project.set(mockProjectResponse);

      fixture.detectChanges();

      const name = fixture.debugElement.query(By.css('.name'));
      const startDate = fixture.debugElement.query(By.css('small span'));

      expect(name.nativeElement.textContent.trim()).toBe(mockProjectResponse.name);
      expect(startDate.nativeElement.textContent.trim()).toBe(`${mockProjectResponse.startDate}`);
    });

    it('should render status, priority, and progress', () => {
      component.project.set(mockProjectResponse);

      fixture.detectChanges();

      const status = fixture.debugElement.query(By.css('span.status'));
      const priority = fixture.debugElement.query(By.css('span.priority'));
      const progress = fixture.debugElement.query(By.css('span.progress'));

      expect(status.nativeElement.textContent.trim()).toBe(mockProjectResponse.status);
      expect(priority.nativeElement.textContent.trim()).toBe(mockProjectResponse.priority);
      expect(progress.nativeElement.textContent.trim()).toBe(`${mockProjectResponse.progress}%`);
    });
  });
});
