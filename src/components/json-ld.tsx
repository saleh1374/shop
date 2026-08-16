export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  const escaped = JSON.stringify(data).replace(/<\/script/gi, "<\\/script");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escaped }}
    />
  );
}
