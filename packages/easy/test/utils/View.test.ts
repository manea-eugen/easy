import '@thisisagile/easy-test';
import { isInOut, View, view } from '../../src';
import { Dev } from '../ref';


describe('View', () => {

  test('construct default view', () => {
    const v = new View();
    expect(v.viewers).toHaveLength(0);
    expect(v.startsFrom).toBe('scratch');
  });

  test('construct non-default view', () => {
    const v = new View({}, 'source');
    expect(v.viewers).toHaveLength(0);
    expect(v.startsFrom).toBe('source');
  });

  test('construct from view()', () => {
    const v = view({}, 'source');
    expect(v.viewers).toHaveLength(0);
    expect(v.startsFrom).toBe('source');
  });


  test('construct with actual view', () => {
    const persons = view({ first: 'FirstName' });
    expect(persons.viewers).toHaveLength(0);
    expect(persons.startsFrom).toBe('scratch');
  });

  test('from scratch and from source', () => {
    const source = {
      FirstName: 'Sander',
      LastName: 'H',
    };
    const fromScratch = view({}, 'scratch');
    const fromSource = view({}, 'source');
    expect(fromScratch.from(source)).toStrictEqual({});
    expect(fromSource.from(source)).toStrictEqual(source);
    expect(fromSource.from(Dev.Wouter)).toStrictEqual(Dev.Wouter.toJSON());
  });

  test('isInOut', () => {
    const v = view({});
    expect(isInOut(undefined)).toBeFalsy();
    expect(isInOut({})).toBeFalsy();
    expect(isInOut({in: {}})).toBeFalsy();
    expect(isInOut({out: {}})).toBeFalsy();
    expect(isInOut({in: () => ''})).toBeTruthy();
    expect(isInOut({in: v})).toBeTruthy();
    expect(isInOut({in: v, col: 'name'})).toBeTruthy();
  })

});
