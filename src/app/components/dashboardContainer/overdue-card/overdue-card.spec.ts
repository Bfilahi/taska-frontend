import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverdueCard } from './overdue-card';

describe('OverdueCard', () => {
  let component: OverdueCard;
  let fixture: ComponentFixture<OverdueCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverdueCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverdueCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
