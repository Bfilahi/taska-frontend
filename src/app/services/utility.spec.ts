import { TestBed } from '@angular/core/testing';

import { Utility } from './utility';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Utility', () => {
  let service: Utility;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
      ]
    });
    service = TestBed.inject(Utility);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should set isDarkMode to true if "dark" is found in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue('dark');
  
      service = new Utility();
  
      expect(service.isDarkMode()).toBeTrue();
    });

    it('should keep isDarkMode false when "dark" is not found in localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
  
      service = new Utility();
  
      expect(service.isDarkMode()).toBeFalse();
    });
  });

  describe('toggleTheme()', () => {
    it('should set isDarkMode to false when it is true', () => {
      service.isDarkMode.set(true);

      service.toggleTheme();

      expect(service.isDarkMode()).toBeFalse();
    });

    it('should set isDarkMode to true when it is false', () => {
      service.isDarkMode.set(false);

      service.toggleTheme();

      expect(service.isDarkMode()).toBeTrue();
    });

    it('should save dark mode to localStorage when isDarkMode is true', () => {
      spyOn(localStorage, 'setItem');
      service.isDarkMode.set(false);

      service.toggleTheme();

      expect(localStorage.setItem).toHaveBeenCalledWith('dark', 'active');
    });

    it('should remove dark mode from localStorage when isDarkMode is false', () => {
      spyOn(localStorage, 'removeItem');
      service.isDarkMode.set(true);

      service.toggleTheme();

      expect(localStorage.removeItem).toHaveBeenCalledWith('dark');
    });
  });
});
