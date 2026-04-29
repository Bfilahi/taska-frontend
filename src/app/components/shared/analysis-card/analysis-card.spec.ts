import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisCard } from './analysis-card';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('AnalysisCard', () => {
  let component: AnalysisCard;
  let fixture: ComponentFixture<AnalysisCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisCard],
      providers: [
        provideZonelessChangeDetection(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 1 card at init', () => {
    const expected = [
      {
        title: '',
        amount: 0,
        icon: '',
        color: '',
        bg: '',
      },
    ];

    fixture.detectChanges();

    expect(component.cards().length).toBe(1);
    expect(component.cards()).toEqual(expected);
  });

  it('should render the correct number of cards', () => {
    const cardElems = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(cardElems.length).toBe(1);
  });
});
