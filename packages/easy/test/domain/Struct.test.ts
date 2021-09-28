import { required, Struct } from '../../src';
import '@thisisagile/easy-test';
import { fits } from '@thisisagile/easy-test';

describe('Struct', () => {
  class Address extends Struct {
    readonly street = this.state.street;
    @required() readonly city = this.state.city;
  }

  test('isValid passes', () => {
    expect(new Address({ city: 'Amsterdam' })).toBeValid();
  });

  test('isValid fails', () => {
    expect(new Address()).not.toBeValid();
  });

  test('update', () => {
    expect(new Address().update({})).toBeInstanceOf(Address);
  });

  test('update updates', () => {
    expect(new Address().update({ city: 'amsterdam' })).toMatchObject(fits.with({ city: 'amsterdam' }));
  });

  test('toString', () => {
    expect(new Address()).toMatchText('Address');
  });

  test('toJson', () => {
    expect(new Address({ city: 'Amsterdam' }).toJSON()).toStrictEqual({ city: 'Amsterdam' });
  });
});
