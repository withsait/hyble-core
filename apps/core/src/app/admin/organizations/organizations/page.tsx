import { prisma } from "@hyble/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Search, Building2, Users, ChevronLeft, ChevronRight, Plus, Globe, Calendar } from "lucide-react";
import Link from "next/link";

interface SearchParams {
  page?: string;
  search?: string;
}

async function getOrganizations(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where: any = {};

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { slug: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { members: true, invites: true },
        },
      },
    }),
    prisma.organization.count({ where }),
  ]);

  return {
    organizations,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  const { organizations, total, page, totalPages } = await getOrganizations(searchParams);

  const buildUrl = (params: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    return `/organizations?${urlParams.toString()}`;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Organizasyonlar</h1>
          <p className="text-slate-400 mt-1">
            Tüm organizasyonları yönetin ({total} organizasyon)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mb-6">
        <form className="flex gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                name="search"
                placeholder="Organizasyon adı veya slug ara..."
                defaultValue={searchParams.search}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            Ara
          </button>
        </form>
      </div>

      {/* Organizations Grid */}
      {organizations.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Organizasyon Bulunamadı</h3>
          <p className="text-slate-400">Arama kriterlerinize uygun organizasyon bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/organizations/${org.slug}`}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-colors group"
            >
              <div className="flex items-start gap-4 mb-4">
                {org.logo ? (
                  <img src={org.logo} alt="" className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-blue-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                    {org.name}
                  </h3>
                  <p className="text-slate-500 text-sm">@{org.slug}</p>
                </div>
              </div>

              {org.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{org.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-slate-400">
                  <Users className="w-4 h-4" />
                  <span>{org._count.members} üye</span>
                </div>
                {org.website && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Globe className="w-4 h-4" />
                    <span className="truncate max-w-[120px]">
                      {org.website.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 mt-4 text-slate-500 text-xs">
                <Calendar className="w-3 h-3" />
                <span>{format(org.createdAt, "dd MMM yyyy", { locale: tr })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} arası gösteriliyor (toplam {total})
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={buildUrl({ ...searchParams, page: String(page - 1) })}
              className={`p-2 rounded-lg ${
                page === 1
                  ? "text-slate-600 cursor-not-allowed pointer-events-none"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Link
                  key={pageNum}
                  href={buildUrl({ ...searchParams, page: String(pageNum) })}
                  className={`px-3 py-1 rounded-lg ${
                    page === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
            <Link
              href={buildUrl({ ...searchParams, page: String(page + 1) })}
              className={`p-2 rounded-lg ${
                page === totalPages
                  ? "text-slate-600 cursor-not-allowed pointer-events-none"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
