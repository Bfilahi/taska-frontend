import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboard } from './dashboard';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Project } from '../../../services/project';
import { User } from '../../../services/user';
import { provideRouter } from '@angular/router';
import { UserResponse } from '../../../dto/userResponse';
import { ProjectsStatsDTO } from '../../../dto/projectsStatsDTO';
import { NEVER } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NewProject } from '../../projectsContainer/new-project/new-project';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  let dialog: jasmine.SpyObj<MatDialog>;
  let mockProjectService: jasmine.SpyObj<Project>;
  let mockUserService: jasmine.SpyObj<User>;

  let mockUserResponse: UserResponse;
  let mockProjectsStats: ProjectsStatsDTO;


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

    it('should open dialog when openNewProjectDialog is called', () => {
      component.openNewProjectDialog();

      expect(dialog.open).toHaveBeenCalledWith(NewProject);
    });
  });
});
