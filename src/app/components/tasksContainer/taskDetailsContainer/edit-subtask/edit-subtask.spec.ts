import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSubtask } from './edit-subtask';

describe('EditSubtask', () => {
  let component: EditSubtask;
  let fixture: ComponentFixture<EditSubtask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSubtask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSubtask);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
