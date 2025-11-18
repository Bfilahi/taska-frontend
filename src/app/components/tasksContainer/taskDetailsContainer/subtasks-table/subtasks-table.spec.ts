import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtasksTable } from './subtasks-table';

describe('SubtasksTable', () => {
  let component: SubtasksTable;
  let fixture: ComponentFixture<SubtasksTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtasksTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtasksTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
