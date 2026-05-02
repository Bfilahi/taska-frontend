import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCard } from './project-card';
import { provideZonelessChangeDetection } from '@angular/core';
import { ProjectResponse } from '../../../dto/projectResponse';
import { Priority } from '../../../enum/priorityEnum';
import { Status } from '../../../enum/statusEnum';
import { By } from '@angular/platform-browser';
import { MatCard } from '@angular/material/card';
import { provideRouter } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

describe('ProjectCard', () => {
  let component: ProjectCard;
  let fixture: ComponentFixture<ProjectCard>;

  let mockProjectResponse: ProjectResponse[];
  

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectCard],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([])
      ]
    })
    .compileComponents();

    mockProjectResponse = [{
      id: 1,
      name: 'project name',
      description: 'project description',
      startDate: new Date(2025, 8, 9),
      dueDate: new Date(2025, 10, 3),
      priority: Priority.HIGH,
      status: Status.ACTIVE,
      progress: 40,
    }]

    fixture = TestBed.createComponent(ProjectCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Rendering / Display', () => {
    it('should render a card for each project', () => {
      fixture.componentRef.setInput('projects', mockProjectResponse);

      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(MatCard));
      expect(cards.length).toBe(mockProjectResponse.length);
    });

    it('should display project name, description, status, priority, and progress', () => {
      fixture.componentRef.setInput('projects', mockProjectResponse);

      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(MatCard));
      cards.forEach((card, index) => {
        const name = card.query(By.css('h2'));
        const description = card.query(By.css('.description'));
        const status = card.query(By.css('.status'));
        const priority = card.query(By.css('.priority'));
        const progress = card.query(By.css('.progress'));

        expect(name.nativeElement.textContent.trim()).toBe(mockProjectResponse[index].name);
        expect(description.nativeElement.textContent.trim()).toBe(mockProjectResponse[index].description);
        expect(status.nativeElement.textContent.trim()).toBe(mockProjectResponse[index].status);
        expect(priority.nativeElement.textContent.trim()).toBe(mockProjectResponse[index].priority);
        expect(progress.nativeElement.textContent.trim()).toBe(`${mockProjectResponse[index].progress}%`);
      });
    });
  });

  describe('Paginator Inputs', () => {
    it('should bind totalElements to paginator length', () => {
      fixture.componentRef.setInput('projects', mockProjectResponse);
      fixture.componentRef.setInput('totalElements', 10);

      fixture.detectChanges();

      expect(component.totalElements()).toBe(10);
    });

    it('should bind partialParams.size to paginator pageSize', () => {
      fixture.componentRef.setInput('projects', mockProjectResponse);
      fixture.componentRef.setInput('partialParams', {page: 1, size: 3});

      fixture.detectChanges();

      expect(component.partialParams().size).toBe(3);
    });

    it('should bind partialParams.page minus 1 to paginator pageIndex', () => {
      fixture.componentRef.setInput('projects', mockProjectResponse);
      fixture.componentRef.setInput('partialParams', { page: 7, size: 3 });

      fixture.detectChanges();

      expect(component.partialParams().page).toBe(7);
    });
  });

  describe('Event Emission', () => {
    it('should emit onClick with the PageEvent when page changes', () => {
      const event: PageEvent = new PageEvent();
      spyOn(component.onClick, 'emit');

      component.onPageChange(event);

      expect(component.onClick.emit).toHaveBeenCalledWith(event);
    });
  });
});
