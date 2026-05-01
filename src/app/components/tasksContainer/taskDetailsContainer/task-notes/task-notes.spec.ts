import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskNotes } from './task-notes';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { User } from '../../../../services/user';
import { Note } from '../../../../services/note';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { UserResponse } from '../../../../dto/userResponse';
import { NoteResponse } from '../../../../dto/noteResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('TaskNotes', () => {
  let component: TaskNotes;
  let fixture: ComponentFixture<TaskNotes>;

  let mockUserService: jasmine.SpyObj<User>;
  let mockNoteService: jasmine.SpyObj<Note>;

  let route: { queryParamMap: Observable<ParamMap> };

  let mockNoteResponse: NoteResponse[];

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('User', [''], { user: signal<UserResponse | null>(null) });
    mockNoteService = jasmine.createSpyObj('Note', ['getAllNotes', 'addNewNote', 'deleteNote']);

    mockNoteService.getAllNotes.and.returnValue(NEVER);

    route = { queryParamMap: of(convertToParamMap({ t_id: 2 })) };

    await TestBed.configureTestingModule({
      imports: [TaskNotes],
      providers: [
        provideZonelessChangeDetection(),
        { provide: User, useValue: mockUserService },
        { provide: Note, useValue: mockNoteService },
        { provide: ActivatedRoute, useValue: route }
      ]
    })
    .compileComponents();

    mockNoteResponse = [{
      id: 1,
      note: 'some note',
      createdAt: new Date(2025, 4, 9)
    }]

    fixture = TestBed.createComponent(TaskNotes);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should parse t_id from query params and call getNotes', () => {
      spyOn<any>(component, 'getNotes');

      fixture.detectChanges();

      expect(component['getNotes']).toHaveBeenCalled();
    });
  });

  describe('getNotes()', () => {
    it('should populate notes signal on successful fetch', () => {
      mockNoteService.getAllNotes.and.returnValue(of(mockNoteResponse));

      fixture.detectChanges();

      expect(component.notes()).toEqual(mockNoteResponse);
    });

    it('should log error and not crash when getNotes fails', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({status: 500});
      mockNoteService.getAllNotes.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('post()', () => {
    let note: {value: string};

    beforeEach(() => {
      note = { value: 'note value' };
    });

    it('should not call noteService when textarea is empty', () => {
      note.value = '';
      mockNoteService.addNewNote.and.returnValue(of(mockNoteResponse[0]));

      component.post(note);

      expect(mockNoteService.addNewNote).not.toHaveBeenCalled();
    });

    it('should not call noteService when textarea is whitespace-only', () => {
      note.value = '     ';
      mockNoteService.addNewNote.and.returnValue(of(mockNoteResponse[0]));

      component.post(note);

      expect(mockNoteService.addNewNote).not.toHaveBeenCalled();
    });

    it('should set isPostLoading to false on successful post', () => {
      mockNoteService.addNewNote.and.returnValue(of(mockNoteResponse[0]));

      component.post(note);

      expect(component.isPostLoading()).toBeFalse();
    });

    it('should set isPostLoading to false on post error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({status: 500});
      mockNoteService.addNewNote.and.returnValue(throwError(() => error));

      component.post(note);

      expect(component.isPostLoading()).toBeFalse();
    });

    it('should call getNotes after successful post', () => {
      mockNoteService.addNewNote.and.returnValue(of(mockNoteResponse[0]));
      spyOn<any>(component, 'getNotes');
      console.log(note);
      component.post(note);

      expect(component['getNotes']).toHaveBeenCalled();
    });
  });

  describe('onDelete()', () => {
    const id: number = 1;

    it('should do nothing if user cancels the confirm dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.onDelete(id);

      expect(mockNoteService.deleteNote).not.toHaveBeenCalled();
    });

    it('should set isDeleteLoading to false on successful delete', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockNoteService.deleteNote.and.returnValue(of(void 0));

      component.onDelete(id);

      expect(component.isDeleteLoading()).toBeFalse();
    });

    it('should set isDeleteLoading to false on delete error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const error: HttpErrorResponse = new HttpErrorResponse({status: 500});
      mockNoteService.deleteNote.and.returnValue(throwError(() => error));

      component.onDelete(id);

      expect(component.isDeleteLoading()).toBeFalse();
    });

    it('should call getNotes after successful delete', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn<any>(component, 'getNotes');
      mockNoteService.deleteNote.and.returnValue(of(void 0));

      component.onDelete(id);

      expect(component['getNotes']).toHaveBeenCalled();
    });
  });

  describe('Template', () => {
    it('should render the correct note count in the header', () => {
      component.notes.set(mockNoteResponse);

      fixture.detectChanges();

      const noteElem = fixture.debugElement.query(By.css('span'));
      expect(noteElem.nativeElement.textContent).toContain(mockNoteResponse.length);
    });
  });
});
