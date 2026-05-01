import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsCard } from './task-details-card';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { Task } from '../../../../services/task';
import { User } from '../../../../services/user';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter } from '@angular/router';
import { UserResponse } from '../../../../dto/userResponse';
import { Status } from '../../../../enum/statusEnum';
import { Priority } from '../../../../enum/priorityEnum';
import { TaskResponse } from '../../../../dto/taskResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('TaskDetailsCard', () => {
  let component: TaskDetailsCard;
  let fixture: ComponentFixture<TaskDetailsCard>;

  
  let mockTaskService: jasmine.SpyObj<Task>;
  let mockUserService: jasmine.SpyObj<User>;

  let routeSub: { queryParamMap: Observable<ParamMap> };

  let mockTaskResponse: TaskResponse;
  let mockUserResponse: UserResponse;

  beforeEach(async () => {
    mockTaskService = jasmine.createSpyObj(['getTask']);
    mockUserService = jasmine.createSpyObj([''], {user: signal<UserResponse | null>(null)});

    mockTaskService.getTask.and.returnValue(NEVER);

    routeSub = {
      queryParamMap: of(convertToParamMap({ t_id: 1, p_id: 2 }))
    };

    await TestBed.configureTestingModule({
      imports: [TaskDetailsCard],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: routeSub },
        { provide: Task, useValue: mockTaskService },
        { provide: User, useValue: mockUserService }
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

    mockUserResponse = {
      id: 1,
      firstName: 'mario',
      lastName: 'rossi',
      email: 'mario.rossi@example.com',
      authorities: { authority: 'USER_ROLE' },
    };

    fixture = TestBed.createComponent(TaskDetailsCard);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization & Data Fetching', () => {
    it('should call getTask when both t_id and p_id are present', () => {
      spyOn<any>(component, 'getTask');

      fixture.detectChanges();

      expect(component['getTask']).toHaveBeenCalled();
    });

    it('should not call getTask when t_id is missing', () => {
      routeSub.queryParamMap = of(convertToParamMap({p_id: 2}));
      spyOn<any>(component, 'getTask');

      fixture.detectChanges();

      expect(component['getTask']).not.toHaveBeenCalled();
    });

    it('should not call getTask when p_id is missing', () => {
      routeSub.queryParamMap = of(convertToParamMap({ t_id: 2 }));
      spyOn<any>(component, 'getTask');

      fixture.detectChanges();

      expect(component['getTask']).not.toHaveBeenCalled();
    });

    it('should not call getTask when t_id is NaN', () => {
      routeSub.queryParamMap = of(convertToParamMap({ p_id: 1, t_id: 'a' }));
      spyOn<any>(component, 'getTask');

      fixture.detectChanges();

      expect(component['getTask']).not.toHaveBeenCalled();
    });

    it('should not call getTask when p_id is NaN', () => {
      routeSub.queryParamMap = of(convertToParamMap({ p_id: 'a', t_id: 1 }));
      spyOn<any>(component, 'getTask');

      fixture.detectChanges();

      expect(component['getTask']).not.toHaveBeenCalled();
    });

    it('should set task signal on successful getTask response', () => {
      mockTaskService.getTask.and.returnValue(of(mockTaskResponse));

      fixture.detectChanges();

      expect(component.task()).toEqual(mockTaskResponse);
    });

    it('should log error on HttpErrorResponse', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({ status: 500 });
      mockTaskService.getTask.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('Template Rendering', () => {
    it('should render task title with TitleCasePipe', () => {
      let capitalizedTitle: string = '';
      mockTaskResponse.title.split(' ').forEach((e) => {
        capitalizedTitle += e.charAt(0).toUpperCase() + e.substring(1);
        capitalizedTitle += ' ';
      });
      component.task.set(mockTaskResponse);

      fixture.detectChanges();

      const titleElem = fixture.debugElement.query(By.css('mat-card-header'));
      expect(titleElem.nativeElement.textContent.trim()).toBe(capitalizedTitle.trim());
    });

    it('should render task description with TitleCasePipe', () => {
      let capitalizedDescription: string = '';
      mockTaskResponse.description.split(' ').forEach((e) => {
        capitalizedDescription += e.charAt(0).toUpperCase() + e.substring(1);
        capitalizedDescription += ' ';
      });
      component.task.set(mockTaskResponse);

      fixture.detectChanges();

      const descriptionElem = fixture.debugElement.query(By.css('.description'));
      expect(descriptionElem.nativeElement.textContent.trim()).toBe(capitalizedDescription.trim());
    });

    it('should render task due date', () => {
      component.task.set(mockTaskResponse);

      fixture.detectChanges();

      const dueDateElem = fixture.debugElement.query(By.css('.dueDate'));
      expect(dueDateElem.nativeElement.textContent.trim()).toBe(`${mockTaskResponse.dueDate}`);
    });

    it('should render user first and last name from userService', () => {
      mockUserService.user.set(mockUserResponse);

      fixture.detectChanges();

      const nameElem = fixture.debugElement.query(By.css('h4')).nativeElement.textContent.trim().split(' ');
      const firstName = nameElem[0];
      const lastName = nameElem[1];

      expect(`${firstName} ${lastName}`).toBe(`${mockUserResponse.firstName} ${mockUserResponse.lastName}`);
    });
  });
});
