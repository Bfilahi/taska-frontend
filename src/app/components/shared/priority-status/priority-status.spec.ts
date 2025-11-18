import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorityStatus } from './priority-status';

describe('PriorityStatus', () => {
  let component: PriorityStatus;
  let fixture: ComponentFixture<PriorityStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriorityStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriorityStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
