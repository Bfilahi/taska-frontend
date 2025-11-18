import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskNotes } from './task-notes';

describe('TaskNotes', () => {
  let component: TaskNotes;
  let fixture: ComponentFixture<TaskNotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskNotes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskNotes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
