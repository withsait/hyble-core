import { Metadata } from "next";
import { DeployWizard } from "@/components/store/deploy/DeployWizard";

interface DeployPageProps {
  params: { slug: string };
}

export const metadata: Metadata = {
  title: "Şablonu Kur | Hyble",
};

export default async function DeployPage({ params }: DeployPageProps) {
  // Auth check would go here
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   redirect(`/auth/login?callbackUrl=/store/${params.slug}/deploy`);
  // }

  // Get template - placeholder for now
  // const template = await api.template.getBySlug.query({ slug: params.slug });
  // if (!template) notFound();

  const template = {
    id: "1",
    slug: params.slug,
    nameTr: "Şablon",
    price: 49,
    thumbnail: "/templates/placeholder.jpg",
    framework: "Next.js",
    deployTime: 60,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <DeployWizard template={template} />
    </div>
  );
}
