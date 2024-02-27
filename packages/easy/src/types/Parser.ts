import { Get, ofGet } from './Get';
import { isDefined, isEmpty, isIn, isObject, isString } from './Is';
import { isValid } from '../validation';
import { Constructor } from './Constructor';
import { toArray } from './Array';

export class Parser<T, V> {
  if = {
    empty: <U>(pred?: Get<U, T>): this => this.evaluate(isEmpty, pred),
    defined: <U>(pred?: Get<U, T>): this => this.evaluate(isDefined, pred),
    valid: <U>(pred?: Get<U, T>): this => this.evaluate(isValid, pred),
    in: (...items: T[]): this => this.evaluate(() => isIn(this.value, toArray(...items))),
    is: {
      object: <U>(pred?: Get<U, T>): this => this.evaluate(isObject, pred),
      string: <U>(pred?: Get<U, T>): this => this.evaluate(isString, pred),
      instance: <U>(c: Constructor<U>, pred?: Get<U, T>): this => this.evaluate(() => this.value instanceof c, pred),
    },
    not: {
      empty: <U>(pred?: Get<U, T>): this => this.evaluateNot(isEmpty, pred),
      defined: <U>(pred?: Get<U, T>): this => this.evaluateNot(isDefined, pred),
      valid: <U>(pred?: Get<U, T>): this => this.evaluateNot(isValid, pred),
      isObject: <U>(pred?: Get<U, T>): this => this.evaluateNot(isObject, pred),
      in: (...items: T[]): this => this.evaluate(() => !isIn(this.value, toArray(...items))),
      is: {
        object: <U>(pred?: Get<U, T>): this => this.evaluateNot(isObject, pred),
        string: <U>(pred?: Get<U, T>): this => this.evaluateNot(isString, pred),
        instance: <U>(c: Constructor<U>, pred?: Get<U, T>): this => this.evaluate(() => !(this.value instanceof c), pred),
      },
    },
  };

  constructor(protected value: T, protected f: Get<V, T>, protected alt: Get<V, T>, readonly valid = true) {}

  protected evaluate<U>(meta: Get<boolean>, pred?: Get<U, T>): this {
    return new (this.constructor as new (value: T, f: Get<V, T>, alt: Get<V, T>, allow?: boolean) => this)(
      this.value,
      this.f,
      this.alt,
      ofGet(meta, pred ? ofGet(pred, this.value) : this.value)
    );
  }

  protected evaluateNot<U>(meta: Get<boolean>, pred?: Get<U, T>): this {
    return new (this.constructor as new (value: T, f: Get<V, T>, alt: Get<V, T>, allow?: boolean) => this)(
      this.value,
      this.f,
      this.alt,
      !ofGet(meta, pred ? ofGet(pred, this.value) : this.value)
    );
  }
}
