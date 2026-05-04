import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Settings } from './settings';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { User } from '../../../services/user';
import { AuthService } from '../../../services/auth-service';
import { HotToastService } from '@ngxpert/hot-toast';
import { UserResponse } from '../../../dto/userResponse';

describe('Settings', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;

  let mockUserService: jasmine.SpyObj<User>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let toaster: HotToastService;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj([''], { user: signal<UserResponse | null>(null) });
    mockAuthService = jasmine.createSpyObj(['']);

    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: User, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    toaster = TestBed.inject(HotToastService);
    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
