import { prisma } from "@hyble/db";
import { getAdminSession } from "@/lib/admin/auth";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  Globe,
  Calendar,
  Mail,
  UserPlus,
  Crown,
  Shield,
  User,
  Eye,
} from "lucide-react";
import { OrganizationActions } from "./OrganizationActions";
import { MemberManagement } from "./MemberManagement";

async function getOrganization(slug: string) {
  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              status: true,
            },
          },
        },
        orderBy: [
          { role: "asc" },
          { joinedAt: "asc" },
        ],
      },
      invites: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { members: true, invites: true },
      },
    },
  });

  return organization;
}

export default async function OrganizationDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  const organization = await getOrganization(params.slug);
  if (!organization) {
    notFound();
  }

  const roleLabels: Record<string, string> = {
    OWNER: "Sahip",
    ADMIN: "Yönetici",
    MEMBER: "Üye",
    VIEWER: "Görüntüleyici",
  };

  const roleIcons: Record<string, any> = {
    OWNER: Crown,
    ADMIN: Shield,
    MEMBER: User,
    VIEWER: Eye,
  };

  const roleColors: Record<string, string> = {
    OWNER: "text-blue-400",
    ADMIN: "text-purple-400",
    MEMBER: "text-slate-400",
    VIEWER: "text-slate-500",
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/organizations"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          {organization.logo ? (
            <img src={organization.logo} alt="" className="w-16 h-16 rounded-xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{organization.name}</h1>
            <p className="text-slate-400 text-sm">@{organization.slug}</p>
          </div>
        </div>
        <OrganizationActions organizationId={organization.id} slug={organization.slug} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Organizasyon Bilgileri
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-slate-500 text-sm">ID</label>
                <p className="text-white">
                  <code className="bg-slate-800 px-2 py-0.5 rounded text-sm">{organization.id}</code>
                </p>
              </div>
              <div>
                <label className="text-slate-500 text-sm">Slug</label>
                <p className="text-white">@{organization.slug}</p>
              </div>
              {organization.description && (
                <div className="col-span-2">
                  <label className="text-slate-500 text-sm">Açıklama</label>
                  <p className="text-white">{organization.description}</p>
                </div>
              )}
              {organization.website && (
                <div>
                  <label className="text-slate-500 text-sm">Website</label>
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" />
                    {organization.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              <div>
                <label className="text-slate-500 text-sm">Oluşturulma Tarihi</label>
                <p className="text-white flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {format(organization.createdAt, "dd MMMM yyyy", { locale: tr })}
                </p>
              </div>
            </div>
          </div>

          {/* Members with Management */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Üyeler ({organization._count.members})
            </h2>
            <MemberManagement
              slug={organization.slug}
              members={organization.members.map((m) => ({
                id: m.id,
                role: m.role,
                joinedAt: m.joinedAt.toISOString(),
                user: {
                  id: m.user.id,
                  name: m.user.name,
                  email: m.user.email,
                  image: m.user.image,
                  status: m.user.status,
                },
              }))}
              invites={organization.invites.map((i) => ({
                id: i.id,
                email: i.email,
                role: i.role,
                status: i.status,
                createdAt: i.createdAt.toISOString(),
              }))}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">İstatistikler</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <span className="text-slate-400">Toplam Üye</span>
                <span className="text-white font-medium">{organization._count.members}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <span className="text-slate-400">Bekleyen Davetler</span>
                <span className="text-blue-400 font-medium">{organization._count.invites}</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Tarihler
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-500 text-sm">Oluşturulma</label>
                <p className="text-white">
                  {format(organization.createdAt, "dd MMMM yyyy HH:mm", { locale: tr })}
                </p>
              </div>
              <div>
                <label className="text-slate-500 text-sm">Son Güncelleme</label>
                <p className="text-white">
                  {format(organization.updatedAt, "dd MMMM yyyy HH:mm", { locale: tr })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
