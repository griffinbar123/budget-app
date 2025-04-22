// /app/utils/utils.test.js

import { formatter } from './utils'; 

describe('Utility Functions', () => {

    describe('formatter (Percentage)', () => {
        it('should format numbers as percentages with two decimal places', () => {
            if (!formatter) {
                throw new Error("Formatter not imported correctly from utils.js");
            }
            expect(formatter.format(0.25)).toBe('25.00%');
            expect(formatter.format(0.12345)).toBe('12.35%');
            expect(formatter.format(1)).toBe('100.00%');
            expect(formatter.format(0)).toBe('0.00%');
            expect(formatter.format(0.005)).toBe('0.50%');
        });
    });

});
