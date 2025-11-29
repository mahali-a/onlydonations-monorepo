/**
 * @see https://twitter.com/buildsghost/status/1507109734519750680
 */
type PromiseHash = Record<string, Promise<unknown>>;

type AwaitedPromiseHash<Hash> = Hash extends PromiseHash
  ? {
      [Key in keyof Hash]: Awaited<Hash[Key]>;
    }
  : never;

/**
 * Get a hash of promises and await them all.
 * Then return the same hash with the resolved values.
 * @example
 * export async function loader({ request }: Route.LoaderArgs) {
 *   return json(
 *     promiseHash({
 *       user: getUser(request),
 *       posts: getPosts(request),
 *     })
 *   );
 * }
 * @example
 * export async function loader({ request }: Route.LoaderArgs) {
 *   return json(
 *     promiseHash({
 *       user: getUser(request),
 *       posts: promiseHash({
 *         list: getPosts(request),
 *         comments: promiseHash({
 *           list: getComments(request),
 *           likes: getLikes(request),
 *         }),
 *       }),
 *     })
 *   );
 * }
 */
export async function promiseHash<Hash extends object>(
  hash: Hash,
): Promise<AwaitedPromiseHash<Hash>> {
  return Object.fromEntries(
    await Promise.all(Object.entries(hash).map(async ([key, promise]) => [key, await promise])),
  );
}
