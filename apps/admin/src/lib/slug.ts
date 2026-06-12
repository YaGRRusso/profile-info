export function isSlugTaken(
  slug: string,
  slugsList: string[] | undefined,
  excludeSlug?: string
): boolean {
  if (!slug || !slugsList?.length) {
    return false;
  }

  if (slug === excludeSlug) {
    return false;
  }

  return slugsList.includes(slug);
}
