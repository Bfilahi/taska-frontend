import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverdueCard } from './overdue-card';
import { provideZonelessChangeDetection } from '@angular/core';
import { GetResponseProjects, Project } from '../../../services/project';
import { NEVER, of, throwError } from 'rxjs';
import { Priority } from '../../../enum/priorityEnum';
import { Status } from '../../../enum/statusEnum';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';

describe('OverdueCard', () => {
  let component: OverdueCard;
  let fixture: ComponentFixture<OverdueCard>;

  let mockProjectService: jasmine.SpyObj<Project>;

  let mockGetResponseProjects: GetResponseProjects;

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj(['getOverdueProjects']);

    mockProjectService.getOverdueProjects.and.returnValue(NEVER);

    await TestBed.configureTestingModule({
      imports: [OverdueCard],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: Project, useValue: mockProjectService },
      ],
    }).compileComponents();

    mockGetResponseProjects = {
      content: [
        {
          id: 1,
          name: 'some project name',
          description: 'some project description',
          startDate: new Date(2025, 9, 3),
          dueDate: new Date(2025, 10, 12),
          priority: Priority.LOW,
          status: Status.ACTIVE,
          progress: 30,
        }
      ],
      page: {
        size: 3,
        number: 2,
        totalElements: 5,
        totalPages: 4,
      }
    }

    fixture = TestBed.createComponent(OverdueCard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call getOverdueProjects on init', () => {
      spyOn<any>(component, 'getOverdueProjects');

      fixture.detectChanges();

      expect(component['getOverdueProjects']).toHaveBeenCalled();
    });
  });

  describe('Successful data fetch', () => {
    it('should set projects signal with response content on success', () => {
      mockProjectService.getOverdueProjects.and.returnValue(of(mockGetResponseProjects));

      fixture.detectChanges();

      expect(component.projects()).toEqual(mockGetResponseProjects.content);
    });

    it('should set totalElements from response page on success', () => {
      mockProjectService.getOverdueProjects.and.returnValue(of(mockGetResponseProjects));

      fixture.detectChanges();

      expect(component.totalElements()).toBe(mockGetResponseProjects.page.totalElements);
    });

    it('should set totalPages from response page on success', () => {
      mockProjectService.getOverdueProjects.and.returnValue(of(mockGetResponseProjects));

      fixture.detectChanges();

      expect(component.totalPages()).toBe(mockGetResponseProjects.page.totalPages);
    });

    it('should sync partialParams page and size from response', () => {
      mockProjectService.getOverdueProjects.and.returnValue(of(mockGetResponseProjects));

      fixture.detectChanges();

      expect(component.partialParams.page).toBe(mockGetResponseProjects.page.number + 1);
      expect(component.partialParams.size).toBe(mockGetResponseProjects.page.size);
    });

    it('should set isLoading to false after successful fetch', () => {
      mockProjectService.getOverdueProjects.and.returnValue(of(mockGetResponseProjects));

      fixture.detectChanges();

      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('Error handling', () => {
    it('should set isLoading to false on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProjectService.getOverdueProjects.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.isLoading()).toBeFalse();
    });

    it('should leave projects empty on error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: {message: 'Something went wrong'}
      });
      mockProjectService.getOverdueProjects.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.projects()).toEqual([]);
    });

    it('should log the error via console.error', () => {
      const error: HttpErrorResponse = new HttpErrorResponse({
        status: 500,
        error: { message: 'Something went wrong' },
      });
      mockProjectService.getOverdueProjects.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('Template rendering', () => {
    it('should render a card for each project', () => {
      component.projects.set(mockGetResponseProjects.content);

      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.css('a'));
      expect(cards.length).toBe(mockGetResponseProjects.content.length);
    });

    it('should display project name and priority', () => {
      component.projects.set(mockGetResponseProjects.content);

      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.css('a'));
      cards.forEach((card, index) => {
        const name = card.query(By.css('h3'));
        const priority = card.query(By.css('p'));

        expect(name.nativeElement.textContent.trim()).toBe(mockGetResponseProjects.content[index].name);
        expect(priority.nativeElement.textContent.trim()).toBe(mockGetResponseProjects.content[index].priority + ' Priority');
      });
    });

    it('should display the correct project count in the badge', () => {
      component.projects.set(mockGetResponseProjects.content);

      fixture.detectChanges();

      const badge = fixture.debugElement.query(By.css('span'));
      expect(badge.nativeElement.textContent.trim()).toBe(`${mockGetResponseProjects.content.length}`);
    });
  });

});
