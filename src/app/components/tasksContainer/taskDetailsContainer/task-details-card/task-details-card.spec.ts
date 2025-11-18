import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailsCard } from './task-details-card';

describe('TaskDetailsCard', () => {
  let component: TaskDetailsCard;
  let fixture: ComponentFixture<TaskDetailsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDetailsCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
