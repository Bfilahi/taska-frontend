import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboard } from './dashboard';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GetResponseProjects, Project } from '../../../services/project';
import { User } from '../../../services/user';
import { provideRouter } from '@angular/router';
import { UserResponse } from '../../../dto/userResponse';
import { ProjectsStatsDTO } from '../../../dto/projectsStatsDTO';
import { NEVER, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Priority } from '../../../enum/priorityEnum';
import { Status } from '../../../enum/statusEnum';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  let dialog: jasmine.SpyObj<MatDialog>;
  let mockProjectService: jasmine.SpyObj<Project>;
  let mockUserService: jasmine.SpyObj<User>;

  let mockUserResponse: UserResponse;
  let mockProjectsStats: ProjectsStatsDTO;
  let mockGetResponseProjects: GetResponseProjects;

  beforeEach(async () => {
    dialog = jasmine.createSpyObj(['open']);
    mockProjectService = jasmine.createSpyObj(
      'Project',
      ['loadProjectsStatus', 'getAllProjects', 'getOverdueProjects'],
      {
        projectsStats: signal<ProjectsStatsDTO>({
          totalProjects: 0,
          completedProjects: 0,
          overdueProjects: 0,
        }),
        projectChanged$: NEVER
      },
    );
    mockUserService = jasmine.createSpyObj('User', [''], { user: signal<UserResponse | null>(null) });

    mockProjectService.loadProjectsStatus.and.returnValue(void 0);
    mockProjectService.getAllProjects.and.returnValue(NEVER);
    mockProjectService.getOverdueProjects.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: Project, useValue: mockProjectService },
        { provide: User, useValue: mockUserService }
      ]
    })
    .overrideComponent(Dashboard, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog },
        ],
      },
    })
    .compileComponents();

    mockUserResponse = {
      id: 1,
      firstName: 'mario',
      lastName: 'rossi',
      email: 'mario.rossi@example.com',
      authorities: {authority: 'USER_ROLE'},
    }

    mockProjectsStats = {
      totalProjects: 2,
      completedProjects: 1,
      overdueProjects: 1,
    };

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
      size: 3,
      number: 2,
      totalElements: 5,
      totalPages: 4,
    }

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Dashboard', () => {
    it('should render the user first name', () => {
      mockUserService.user.set(mockUserResponse);
      const capitalizedName =
        mockUserResponse.firstName.charAt(0).toUpperCase() + mockUserResponse.firstName.substring(1);

      fixture.detectChanges();

      const h2 = fixture.debugElement.query(By.css('h2'));
      expect(h2.nativeElement.textContent).toContain(capitalizedName);
    });

    it('should call loadProjectsStatus on init', () => {
      expect(mockProjectService.loadProjectsStatus).toHaveBeenCalled();
    });

    it('should map projectsStats to cards correctly', () => {
      mockProjectService.projectsStats.set(mockProjectsStats);

      fixture.detectChanges();

      expect(mockProjectService.projectsStats()).toEqual(mockProjectsStats);
    });

    it('should open the new project dialog when button is clicked', () => {
      spyOn(component, 'openNewProjectDialog');

      const btn = fixture.debugElement.query(By.css('button'));
      btn.triggerEventHandler('click', null);

      expect(component.openNewProjectDialog).toHaveBeenCalled();
    });
  });
});
