import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTaskFormProject } from './project-task-form-project';

describe('ProjectTaskFormProject', () => {
  let component: ProjectTaskFormProject;
  let fixture: ComponentFixture<ProjectTaskFormProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTaskFormProject]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTaskFormProject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
