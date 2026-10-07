/** <meta property="og:…"> tags; React hoists them into <head>. */
export default function LegacyOg({ tags }: { tags: [string, string][] }) {
  return <>{tags.map(([property, content]) => <meta key={property} property={property} content={content} />)}</>;
}
