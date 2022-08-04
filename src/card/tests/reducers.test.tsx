// import { expect } from 'chai';
// import { todos } from '../../page/logic/pageReducer';
// import { describe } from 'mocha';

// /**
//  * TODO - write tests...
//  */
// describe('Todos reducer test', () => {
//     it('Adds a new todo when CREATE_TODO action is received', () => {
//         const fakeTodo = { text: 'hello', isCompleted: false };
//         const fakeAction = {
//             type: 'CREATE_TODO',
//             payload: { 
//                 todo: fakeTodo,
//             },
//         }
//         const originalState = { isLoading: false, data: [] };
//         const expected = {
//             isLoading: false,
//             data: [fakeTodo],
//         }
//         const actual = todos(originalState, fakeAction);
//         expect(actual).to.deep.equal(expected);
//     });
// });