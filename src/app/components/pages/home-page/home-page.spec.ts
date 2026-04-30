import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePage } from './home-page';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { SignUp } from '../../auth/sign-up/sign-up';
import { Login } from '../../auth/login/login';
import { By } from '@angular/platform-browser';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    dialog = jasmine.createSpyObj(['open']);

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
      ]
    })
    .overrideComponent(HomePage, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open dialog with SignUp when openSignUpDialog is called', () => {
    component.openSignUpDialog();

    expect(dialog.open).toHaveBeenCalledWith(SignUp);
  });

  it('should open dialog with Login when openLoginDialog is called', () => {
    component.openLoginDialog();

    expect(dialog.open).toHaveBeenCalledWith(Login);
  });

  it('should trigger openSignUpDialog when sign-up button is called', () => {
    spyOn(component, 'openSignUpDialog');

    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button.signup-btn'));
    btn.triggerEventHandler('click', null);
    expect(component.openSignUpDialog).toHaveBeenCalled();
  });

  it('should trigger openLoginDialog when login button is called', () => {
    spyOn(component, 'openLoginDialog');

    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button.login-btn'));
    btn.triggerEventHandler('click', null);
    expect(component.openLoginDialog).toHaveBeenCalled();
  });
});
