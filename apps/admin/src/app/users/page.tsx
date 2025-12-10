import { prisma } from "@hyble/database";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Search, Filter, ChevronLeft, ChevronRight, Download, CheckSquare } from "lucide-react";
import Link from "next/link";
import { UserActions } from "./UserActions";

interface SearchParams {
  page?: string;
  search?: string;
  role?: string;
  status?: string;
  verified?: string;
}

async function getUsers(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where: any = {};

  if (searchParams.search) {
    where.OR = [
      { email: { contains: searchParams.search, mode: "insensitive" } },
      { name: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  if (searchParams.role && searchParams.role !== "all") {
    where.role = searchParams.role;
  }

  if (searchParams.status && searchParams.status !== "all") {
    where.status = searchParams.status;
  }

  if (searchParams.verified === "true") {
    where.emailVerified = { not: null };
  } else if (searchParams.verified === "false") {
    where.emailVerified = null;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        emailVerified: true,
        image: true,
        twoFactorAuth: {
          select: { enabled: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  const { users, total, page, totalPages } = await getUsers(searchParams);

  const buildUrl = (params: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    return `/users?${urlParams.toString()}`;
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kullanıcı Yönetimi</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Tüm kayıtlı kullanıcıları yönetin ({total} kullanıcı)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/api/export/users"
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV İndir
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm mb-6">
        <form className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                name="search"
                placeholder="E-posta veya isim ara..."
                defaultValue={searchParams.search}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              name="role"
              defaultValue={searchParams.role || "all"}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tüm Roller</option>
              <option value="user">Kullanıcı</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              name="status"
              defaultValue={searchParams.status || "all"}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="suspended">Askıda</option>
              <option value="banned">Yasaklı</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              name="verified"
              defaultValue={searchParams.verified || "all"}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Doğrulama</option>
              <option value="true">Doğrulanmış</option>
              <option value="false">Beklemede</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            Ara
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">Kullanıcı</th>
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">ID</th>
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">Rol</th>
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">Durum</th>
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">2FA</th>
              <th className="text-left py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">Kayıt</th>
              <th className="text-right py-4 px-6 text-slate-600 dark:text-slate-400 font-medium text-sm">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="py-4 px-6">
                  <Link href={`/users/${user.id}`} className="flex items-center gap-3 group">
                    {user.image ? (
                      <img src={user.image} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {user.name || "İsimsiz"}
                      </p>
                      <p className="text-slate-500 dark:text-slate-500 text-sm">{user.email}</p>
                    </div>
                  </Link>
                </td>
                <td className="py-4 px-6">
                  <code className="text-slate-600 dark:text-slate-400 text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {user.id.slice(0, 8)}...
                  </code>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}>
                    {user.role === "admin" ? "Admin" : "Kullanıcı"}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === "ACTIVE"
                      ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                      : user.status === "SUSPENDED"
                      ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                      : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                  }`}>
                    {user.status === "ACTIVE" ? "Aktif" : user.status === "SUSPENDED" ? "Askıda" : "Dondurulmuş"}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {user.twoFactorAuth?.enabled ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                      Aktif
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      Kapalı
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm">
                  {format(user.createdAt, "dd MMM yyyy", { locale: tr })}
                </td>
                <td className="py-4 px-6 text-right">
                  <UserActions userId={user.id} currentRole={user.role} currentStatus={user.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} arası gösteriliyor (toplam {total})
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={buildUrl({ ...searchParams, page: String(page - 1) })}
                className={`p-2 rounded-lg ${
                  page === 1
                    ? "text-slate-400 dark:text-slate-600 cursor-not-allowed pointer-events-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
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
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
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
                    ? "text-slate-400 dark:text-slate-600 cursor-not-allowed pointer-events-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
