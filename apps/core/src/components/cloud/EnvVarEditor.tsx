"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";

const Label = ({ children, className = "", htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>{children}</label>
);
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface EnvVarEditorProps {
  siteSlug: string;
}

interface EnvVar {
  id: string;
  key: string;
  value: string;
}

// Mock data - will be replaced with tRPC query when cloud router is implemented
const mockEnvVars: EnvVar[] = [
  { id: "1", key: "NODE_ENV", value: "production" },
  { id: "2", key: "DATABASE_URL", value: "postgres://..." },
  { id: "3", key: "API_KEY", value: "sk-1234567890abcdef" },
];

export function EnvVarEditor({ siteSlug }: EnvVarEditorProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [envVars, setEnvVars] = useState<EnvVar[]>(mockEnvVars);
  const [isAdding, setIsAdding] = useState(false);

  // TODO: Replace with tRPC query when cloud router is ready
  // const { data, isLoading, refetch } = trpc.cloud.envVars.list.useQuery({ siteSlug });

  const toggleReveal = (id: string) => {
    const newSet = new Set(revealedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setRevealedIds(newSet);
  };

  const handleAdd = async () => {
    if (newKey && newValue) {
      setIsAdding(true);
      // Mock add - will be replaced with tRPC mutation
      await new Promise(resolve => setTimeout(resolve, 300));
      setEnvVars([...envVars, { id: String(envVars.length + 1), key: newKey, value: newValue }]);
      setNewKey("");
      setNewValue("");
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    setEnvVars(envVars.filter(e => e.id !== id));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Key className="h-5 w-5" />
            Environment Variables
          </h3>
          <p className="text-sm text-muted-foreground">
            Build sürecinde kullanılacak ortam değişkenleri
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            Environment değişkenleri şifrelenmiş olarak saklanır. Değişiklikler bir sonraki deployment'ta geçerli olur.
          </p>
        </div>
      </div>

      {/* Add New */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
        <div className="space-y-2">
          <Label>Anahtar (Key)</Label>
          <Input
            placeholder="API_KEY"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label>Değer (Value)</Label>
          <Input
            type="password"
            placeholder="sk-xxxx..."
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={handleAdd}
            disabled={!newKey || !newValue || isAdding}
            className="w-full"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Ekle
          </Button>
        </div>
      </div>

      {/* Existing Variables */}
      {envVars.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Key className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Henüz değişken eklenmemiş</p>
        </div>
      ) : (
        <div className="space-y-3">
          {envVars.map((envVar) => {
            const isRevealed = revealedIds.has(envVar.id);

            return (
              <div
                key={envVar.id}
                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="font-mono text-sm font-medium">
                    {envVar.key}
                  </div>
                  <div className="font-mono text-sm text-muted-foreground flex items-center gap-2">
                    {isRevealed ? envVar.value : "•".repeat(20)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleReveal(envVar.id)}
                  >
                    {isRevealed ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(envVar.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Common Keys */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-xs text-muted-foreground mb-2">Sık kullanılan değişkenler:</p>
        <div className="flex flex-wrap gap-2">
          {["NODE_ENV", "DATABASE_URL", "API_KEY", "NEXT_PUBLIC_API_URL"].map((key) => (
            <button
              key={key}
              onClick={() => setNewKey(key)}
              className="text-xs font-mono px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors"
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
