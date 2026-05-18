import { isNil, pickBy } from "lodash";

export function clearObject<T extends object>(obj?: T) {
  return pickBy(obj, (v) => !isNil(v));
}
