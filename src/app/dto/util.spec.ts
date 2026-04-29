import { AbstractControl } from '@angular/forms';
import { Util } from './util';

describe('Util', () => {
  describe('priorities', () => {
    it('should have exactly 3 items', () => {
      expect(Util.priorities.length).toBe(3);
    });

    it('should contain LOW, MEDIUM, HIGH in order', () => {
      const values = Util.priorities.map((p) => p.value);
      expect(values).toEqual(['LOW', 'MEDIUM', 'HIGH']);
    });

    it('should have matching value and viewValue for each item', () => {
      Util.priorities.forEach((p) => {
        expect(p.value).toBe(p.viewValue);
      });
    });
  });

  describe('statuses', () => {
    it('should have exactly 2 items', () => {
      expect(Util.statuses.length).toBe(2);
    });
  });

  describe('dateMustBeAfterToday', () => {
    const buildControl = (value: Date | null): AbstractControl => ({ value }) as AbstractControl;

    it('should return a validator function', () => {
      expect(typeof Util.dateMustBeAfterToday()).toBe('function');
    });

    it('should return null when control value is null', () => {
      const validator = Util.dateMustBeAfterToday();
      expect(validator(buildControl(null))).toBeNull();
    });

    it('should return null for a date in the future', () => {
      const validator = Util.dateMustBeAfterToday();
      const futureDate = new Date(Date.now() + 86400000);
      expect(validator(buildControl(futureDate))).toBeNull();
    });

    it('should return { dateAfterToday: true } for a date in the past', () => {
      const validator = Util.dateMustBeAfterToday();
      const pastDate = new Date(Date.now() - 86400000);
      expect(validator(buildControl(pastDate))).toEqual({ dateAfterToday: true });
    });

    it('should return { dateAfterToday: true } for the current moment', () => {
      const validator = Util.dateMustBeAfterToday();
      const now = new Date();
      expect(validator(buildControl(now))).toEqual({ dateAfterToday: true });
    });
  });
});
