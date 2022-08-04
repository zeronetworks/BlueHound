

// import { expect } from 'chai';
// import { getBorderStyleForDate } from '../logic/cardStyle';
// import { describe } from 'mocha';

// /**
//  * TODO - write tests...
//  */
// describe('getBorderStyleForDate', () => {
//     it('Returns none when the date is less than five days ago', () => {
//         const today = Date.now();
//         const recentDate = new Date(Date.now() - 8640000 * 3);
//         const expected = 'none';
//         const actual = getBorderStyleForDate(recentDate, today);
//         expect(actual).to.equal(expected);
//     });
//     it('Returns border when the date is more than five days ago', () => {
//         const today = Date.now();
//         const recentDate = new Date(Date.now() - 8640000 * 7);
//         const expected = '5px solid red';
//         const actual = getBorderStyleForDate(recentDate, today);
//         expect(actual).to.equal(expected);
//     });
// });