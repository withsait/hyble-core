// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Github, GitlabIcon, FolderGit2,
  Globe, Server, Upload, ExternalLink, CheckCircle, ChevronRight
} from "lucide-react";

type Framework = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

const frameworks: Framework[] = [
  { id: "nextjs", name: "Next.js", icon: "▲", description: "React framework for production" },
  { id: "react", name: "React", icon: "⚛️", description: "A JavaScript library for building user interfaces" },
  { id: "vue", name: "Vue.js", icon: "💚", description: "The Progressive JavaScript Framework" },
  { id: "nuxt", name: "Nuxt", icon: "💚", description: "The Intuitive Vue Framework" },
  { id: "svelte", name: "SvelteKit", icon: "🔥", description: "Cybernetically enhanced web apps" },
  { id: "astro", name: "Astro", icon: "🚀", description: "Build faster websites" },
  { id: "node", name: "Node.js", icon: "💻", description: "JavaScript runtime" },
  { id: "static", name: "Static", icon: "📄", description: "Static HTML, CSS, JS" },
];

type ImportMethod = "github" | "gitlab" | "bitbucket" | "upload" | null;

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<"method" | "repository" | "configure">("method");
  const [importMethod, setImportMethod] = useState<ImportMethod>(null);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [outputDir, setOutputDir] = useState(".next");
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMethodSelect = (method: ImportMethod) => {
    setImportMethod(method);
    if (method === "upload") {
      setStep("configure");
    } else {
      setStep("repository");
    }
  };

  const handleRepoSubmit = () => {
    // Extract project name from repo URL
    const parts = repoUrl.split("/");
    const repoName = parts[parts.length - 1]?.replace(".git", "") || "";
    setProjectName(repoName);
    setStep("configure");
  };

  const handleDeploy = async () => {
    setLoading(true);
    // TODO: Implement actual deployment via tRPC
    console.log({
      importMethod,
      repoUrl,
      branch,
      projectName,
      selectedFramework,
      buildCommand,
      outputDir,
      envVars,
    });

    // Simulate deployment
    setTimeout(() => {
      router.push("/projects");
    }, 2000);
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const updateEnvVar = (index: number, field: "key" | "value", value: string) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/projects"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Yeni Proje
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {step === "method" && "Projenizi nasıl import etmek istediğinizi seçin."}
            {step === "repository" && "Repository bilgilerinizi girin."}
            {step === "configure" && "Proje ayarlarını yapılandırın."}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          step === "method"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        }`}>
          {step !== "method" ? <CheckCircle className="h-4 w-4" /> : "1"}
          <span>Import Yöntemi</span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          step === "repository"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : step === "configure"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        }`}>
          {step === "configure" ? <CheckCircle className="h-4 w-4" /> : "2"}
          <span>Repository</span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          step === "configure"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        }`}>
          3
          <span>Yapılandırma</span>
        </div>
      </div>

      {/* Step 1: Import Method */}
      {step === "method" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleMethodSelect("github")}
            className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-slate-900 dark:group-hover:bg-white transition-colors">
                <Github className="h-6 w-6 text-slate-700 dark:text-slate-300 group-hover:text-white dark:group-hover:text-slate-900" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">GitHub</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  GitHub repository'den import et
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleMethodSelect("gitlab")}
            className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-orange-500 transition-colors">
                <FolderGit2 className="h-6 w-6 text-slate-700 dark:text-slate-300 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">GitLab</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  GitLab repository'den import et
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleMethodSelect("bitbucket")}
            className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-600 transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-blue-600 transition-colors">
                <FolderGit2 className="h-6 w-6 text-slate-700 dark:text-slate-300 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Bitbucket</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Bitbucket repository'den import et
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleMethodSelect("upload")}
            className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-purple-500 transition-colors">
                <Upload className="h-6 w-6 text-slate-700 dark:text-slate-300 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Dosya Yükle</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ZIP dosyası yükleyerek deploy et
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Step 2: Repository */}
      {step === "repository" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Repository URL
            </label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://github.com/username/repository"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="main"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep("method")}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Geri
            </button>
            <button
              onClick={handleRepoSubmit}
              disabled={!repoUrl}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Devam Et
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Configure */}
      {step === "configure" && (
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
              Proje Bilgileri
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Proje Adı
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="my-awesome-project"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Projeniz şu adreste yayınlanacak: <span className="font-mono">{projectName || "project"}.hyble.net</span>
              </p>
            </div>

            {/* Framework Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Framework
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {frameworks.map((framework) => (
                  <button
                    key={framework.id}
                    type="button"
                    onClick={() => setSelectedFramework(framework.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedFramework === framework.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <span className="text-2xl">{framework.icon}</span>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                      {framework.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Build Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
              Build Ayarları
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Build Komutu
                </label>
                <input
                  type="text"
                  value={buildCommand}
                  onChange={(e) => setBuildCommand(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="npm run build"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Output Dizini
                </label>
                <input
                  type="text"
                  value={outputDir}
                  onChange={(e) => setOutputDir(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder=".next"
                />
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                Ortam Değişkenleri
              </h2>
              <button
                type="button"
                onClick={addEnvVar}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Ekle
              </button>
            </div>

            {envVars.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Henüz ortam değişkeni eklenmedi.
              </p>
            ) : (
              <div className="space-y-3">
                {envVars.map((env, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={env.key}
                      onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
                      placeholder="KEY"
                    />
                    <span className="text-slate-400">=</span>
                    <input
                      type="text"
                      value={env.value}
                      onChange={(e) => updateEnvVar(index, "value", e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
                      placeholder="value"
                    />
                    <button
                      type="button"
                      onClick={() => removeEnvVar(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => importMethod === "upload" ? setStep("method") : setStep("repository")}
              className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Geri
            </button>
            <button
              onClick={handleDeploy}
              disabled={loading || !projectName}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Deploy Ediliyor...
                </>
              ) : (
                <>
                  <Server className="h-5 w-5" />
                  Deploy Et
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
