// Force dynamic rendering for blog pages - client-side tRPC requires runtime context
export const dynamic = "force-dynamic";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
