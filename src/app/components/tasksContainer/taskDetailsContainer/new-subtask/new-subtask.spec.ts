import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSubtask } from './new-subtask';

describe('NewSubtask', () => {
  let component: NewSubtask;
  let fixture: ComponentFixture<NewSubtask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSubtask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewSubtask);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
