/**
 * Safely try to execute a promise, returning a tuple of [error, result].
 *
 * If the promise rejects or an error is thrown, the error will be the first element of the tuple.
 *
 * If the promise resolves, the result will be the second element of the tuple.
 *
 * @note If the tuple error value is null, the promise was not rejected and no error was thrown.
 * So the result value is guaranteed to be the promise's resolve value. (This can obviously be null
 * if the promise resolves to null, so always check the error value for the success state.)
 *
 * @param promise - The promise to try to execute.
 * @returns A tuple of [error, result].
 *
 * @example
 * ```ts
 * const [err, result] = await safeTry(Promise.resolve(42));
 *
 * console.log(result); // null or 42
 *
 * if (err) {
 *   console.error(err);
 *   return 'Not Found'
 * }
 *
 * console.log(result); // 42
 * return result;
 * ```
 */
export async function safeTry<T, E = Error>(promise: Promise<T>): Promise<[null, T] | [E, null]> {
  try {
    const result = await promise;
    return [null, result];
  } catch (err) {
    return [err as E, null];
  }
}
