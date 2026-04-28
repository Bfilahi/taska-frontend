import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbar } from './navbar';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Utility } from '../../services/utility';
import { AuthService } from '../../services/auth-service';
import { By } from '@angular/platform-browser';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  let dialog: MatDialog;
  let mockUtilityService: jasmine.SpyObj<Utility>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockUtilityService = jasmine.createSpyObj(['toggleTheme'], {
      isDarkMode: signal<boolean>(false),
      opened: signal<boolean>(false),
    });
    mockAuthService = jasmine.createSpyObj(['logout'], { isLoggedIn: signal<boolean>(false) });

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Utility, useValue: mockUtilityService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Template', () => {
    it('should show menu button and logout button when logged in', () => {
      mockAuthService.isLoggedIn.set(true);

      fixture.detectChanges();

      const menuBtn = fixture.debugElement.query(By.css('.menu-btn'));
      const logoutBtn = fixture.debugElement.query(By.css('.logout-btn'));

      expect(menuBtn).toBeTruthy();
      expect(logoutBtn).toBeTruthy();
    });

    it('should show sign up and login buttons when logged out', () => {
      mockAuthService.isLoggedIn.set(false);

      fixture.detectChanges();

      const signupBtn = fixture.debugElement.query(By.css('.signup-btn'));
      const loginBtn = fixture.debugElement.query(By.css('.login-btn'));

      expect(signupBtn).toBeTruthy();
      expect(loginBtn).toBeTruthy();
    });

    it('should not show menu button when logged out', () => {
      mockAuthService.isLoggedIn.set(false);

      fixture.detectChanges();

      const menuBtn = fixture.debugElement.query(By.css('.menu-btn'));
      const logoutBtn = fixture.debugElement.query(By.css('.logout-btn'));

      expect(menuBtn).toBeNull();
      expect(logoutBtn).toBeNull();
    });

    it('should render dark mode icon when dark mode is active', () => {
      mockUtilityService.isDarkMode.set(true);

      fixture.detectChanges();

      const darkModeIcon = fixture.debugElement.query(By.css('[fontIcon="dark_mode"]'));
      expect(darkModeIcon).toBeTruthy();
    });

    it('should render light mode icon when dark mode is inactive', () => {
      mockUtilityService.isDarkMode.set(false);

      fixture.detectChanges();

      const darkModeIcon = fixture.debugElement.query(By.css('[fontIcon="light_mode"]'));
      expect(darkModeIcon).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should toggle utilityService.opened when menu button is clicked', () => {
      mockAuthService.isLoggedIn.set(true);
      mockUtilityService.opened.set(false);

      fixture.detectChanges();

      const menuBtn = fixture.debugElement.query(By.css('.menu-btn'));
      menuBtn.triggerEventHandler('click', null);
      expect(mockUtilityService.opened()).toBeTrue();
    });

    it('should call utilityService.toggleTheme when theme button is clicked', () => {
      const themeBtn = fixture.debugElement.query(By.css('.theme-btn'));
      themeBtn.triggerEventHandler('click', null);

      expect(mockUtilityService.toggleTheme).toHaveBeenCalled();
    });

    it('should call authService.logout when logout button is clicked', () => {
      mockAuthService.isLoggedIn.set(true);
      spyOn(component, 'logout');

      fixture.detectChanges();

      const logoutBtn = fixture.debugElement.query(By.css('.logout-btn'));
      logoutBtn.triggerEventHandler('click', null);
      expect(component.logout).toHaveBeenCalled();
    });

    it('should open Login dialog when login button is clicked', () => {
      mockAuthService.isLoggedIn.set(false);
      spyOn(component, 'openLoginDialog');

      fixture.detectChanges();

      const loginBtn = fixture.debugElement.query(By.css('.login-btn'));
      loginBtn.triggerEventHandler('click', null);
      expect(component.openLoginDialog).toHaveBeenCalled();
    });

    it('should open SignUp dialog when sign up button is clicked', () => {
      mockAuthService.isLoggedIn.set(false);
      spyOn(component, 'openSignUpDialog');

      fixture.detectChanges();

      const signupBtn = fixture.debugElement.query(By.css('.signup-btn'));
      signupBtn.triggerEventHandler('click', null);
      expect(component.openSignUpDialog).toHaveBeenCalled();
    });
  });

  describe('Dark Mode Effect', () => {
    it('should add dark class to documentElement when dark mode is enabled', () => {
      mockUtilityService.isDarkMode.set(true);

      fixture.detectChanges();

      expect(document.documentElement.classList).toContain('dark');
    });

    it('should remove dark class from documentElement when dark mode is disabled', () => {
      mockUtilityService.isDarkMode.set(false);

      fixture.detectChanges();

      expect(document.documentElement.classList).not.toContain('dark');
    });
  });

  describe('methods', () => {
    it('should call dialog.open when openLoginDialog() is called', () => {
      spyOn(dialog, 'open');

      component.openLoginDialog();

      expect(dialog.open).toHaveBeenCalled();
    });

    it('should call dialog.open when openSignUpDialog() is called', () => {
      spyOn(dialog, 'open');

      component.openSignUpDialog();

      expect(dialog.open).toHaveBeenCalled();
    });

    it('should call authService.logout when logout() is called', () => {
      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

});
