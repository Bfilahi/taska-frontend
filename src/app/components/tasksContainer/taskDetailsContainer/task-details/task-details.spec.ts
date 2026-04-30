import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetails } from './task-details';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { User } from '../../../../services/user';
import { Note } from '../../../../services/note';
import { Task } from '../../../../services/task';
import { Project } from '../../../../services/project';
import { Subtask } from '../../../../services/subtask';
import { HotToastService } from '@ngxpert/hot-toast';
import { NEVER, Subject } from 'rxjs';
import { UserResponse } from '../../../../dto/userResponse';
import { NewSubtask } from '../new-subtask/new-subtask';
import { By } from '@angular/platform-browser';

describe('TaskDetails', () => {
  let component: TaskDetails;
  let fixture: ComponentFixture<TaskDetails>;

  let dialog: jasmine.SpyObj<MatDialog>;
  let mockUserService: jasmine.SpyObj<User>;
  let mockNoteService: jasmine.SpyObj<Note>;
  let mockTaskService: jasmine.SpyObj<Task>;
  let mockProjectService: jasmine.SpyObj<Project>;
  let mockSubtaskService: jasmine.SpyObj<Subtask>;

  let mockHotToastService: HotToastService;

  let subtaskSubject: Subject<void>;
  let mockUserResponse: UserResponse;


  beforeEach(async () => {
    subtaskSubject = new Subject<void>();
    mockUserResponse = {
      id: 1,
      firstName: 'mario',
      lastName: 'rossi',
      email: 'mario.rossi@example.com',
      authorities: { authority: 'USER_ROLE' },
    };

    dialog = jasmine.createSpyObj(['open']);
    mockUserService = jasmine.createSpyObj('User', [''], {user: signal<UserResponse | null>(mockUserResponse)});
    mockNoteService = jasmine.createSpyObj(['getAllNotes']);
    mockTaskService = jasmine.createSpyObj(['']);
    mockProjectService = jasmine.createSpyObj(['']);
    mockSubtaskService = jasmine.createSpyObj(['getSubTasks'], {subtaskChanged$: subtaskSubject.asObservable()});
    mockHotToastService = jasmine.createSpyObj(['']);

    mockNoteService.getAllNotes.and.returnValue(NEVER);
    mockSubtaskService.getSubTasks.and.returnValue(NEVER);
    
    await TestBed.configureTestingModule({
      imports: [TaskDetails],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: User, useValue: mockUserService },
        { provide: Note, useValue: mockNoteService },
        { provide: Task, useValue: mockTaskService },
        { provide: Project, useValue: mockProjectService },
        { provide: Subtask, useValue: mockSubtaskService },
        { provide: HotToastService, useValue: mockHotToastService }
      ]
    })
    .overrideComponent(TaskDetails, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct initial priorities array', () => {
    const mockPriorities = [
      { value: 'LOW-0', viewValue: 'LOW' },
      { value: 'MEDIUM-1', viewValue: 'MEDIUM' },
      { value: 'HIGH-2', viewValue: 'HIGH' },
    ];

    expect(component.priorities).toEqual(mockPriorities);
  });

  it('should have the correct initial priorities array', () => {
    const mockStatus = [
      { value: 'TODO-0', viewValue: 'TODO' },
      { value: 'IN_PROGRESS-1', viewValue: 'IN PROGRESS' },
      { value: 'COMPLETED-2', viewValue: 'COMPLETED' },
    ];

    expect(component.status).toEqual(mockStatus);
  });

  it('should open dialog with NewSubtask when openNewTaskDialog is called', () => {
    component.openNewTaskDialog();

    expect(dialog.open).toHaveBeenCalledWith(NewSubtask);
  });

  it('should invoke the openNewTaskDialog method when the button is clicked', () => {
    spyOn(component, 'openNewTaskDialog');

    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button.new-task-btn'));
    btn.triggerEventHandler('click', new MouseEvent('click'));

    expect(component.openNewTaskDialog).toHaveBeenCalled();
  });
});
