import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { User } from './services/user';
import { AuthService } from './services/auth-service';

describe('App', () => {
  let app: App;
  let fixture: ComponentFixture<App>;

  let mockUserService: jasmine.SpyObj<User>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj(['getUser']);
    mockAuthService = jasmine.createSpyObj(['isLoggedIn']);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: User, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should call userService.getUser() when user is logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);

    fixture.detectChanges();

    expect(mockUserService.getUser).toHaveBeenCalled();
  });

  it('should not call userService.getUser() when user is NOT logged in', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    fixture.detectChanges();

    expect(mockUserService.getUser).not.toHaveBeenCalled();
  });
});
