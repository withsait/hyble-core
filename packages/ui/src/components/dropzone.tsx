"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface FileWithPreview extends File {
  preview?: string;
  id?: string;
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "success" | "error";
  uploadError?: string;
  uploadedUrl?: string;
}

export interface DropzoneProps {
  onFilesSelected?: (files: FileWithPreview[]) => void;
  onFilesUploaded?: (files: FileWithPreview[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  showPreview?: boolean;
  previewGridCols?: number;
}

const defaultAccept = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const Dropzone = React.forwardRef<DropzoneRef, DropzoneProps>(
  (
    {
      onFilesSelected,
      onFilesUploaded,
      accept = defaultAccept,
      maxSize = 10 * 1024 * 1024, // 10MB default
      maxFiles = 10,
      multiple = true,
      disabled = false,
      className,
      children,
      showPreview = true,
      previewGridCols = 4,
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [files, setFiles] = React.useState<FileWithPreview[]>([]);
    const [errors, setErrors] = React.useState<string[]>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dragCounter = React.useRef(0);

    // Cleanup previews on unmount
    React.useEffect(() => {
      return () => {
        files.forEach((file) => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
      };
    }, [files]);

    const validateFile = (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `${file.name}: Dosya boyutu çok büyük (maks. ${formatFileSize(maxSize)})`;
      }

      // Check file type
      const acceptedTypes = Object.entries(accept).flatMap(([type, exts]) => {
        if (type.endsWith("/*")) {
          return [type.replace("/*", "/")];
        }
        return exts;
      });

      const fileType = file.type;
      const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;

      const isAccepted = acceptedTypes.some((accepted) => {
        if (accepted.startsWith(".")) {
          return fileExt === accepted.toLowerCase();
        }
        if (accepted.endsWith("/")) {
          return fileType.startsWith(accepted);
        }
        return fileType === accepted;
      });

      if (!isAccepted) {
        return `${file.name}: Desteklenmeyen dosya türü`;
      }

      return null;
    };

    const processFiles = (fileList: FileList | File[]) => {
      const newErrors: string[] = [];
      const validFiles: FileWithPreview[] = [];
      const filesArray = Array.from(fileList);

      // Check max files
      const totalFiles = files.length + filesArray.length;
      if (totalFiles > maxFiles) {
        newErrors.push(`En fazla ${maxFiles} dosya yükleyebilirsiniz`);
        return;
      }

      filesArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
        } else {
          // Check for duplicates
          const isDuplicate = files.some(
            (f) => f.name === file.name && f.size === file.size
          );
          if (!isDuplicate) {
            const fileWithPreview = Object.assign(file, {
              preview: file.type.startsWith("image/")
                ? URL.createObjectURL(file)
                : undefined,
              id: generateId(),
              uploadProgress: 0,
              uploadStatus: "pending" as const,
            });
            validFiles.push(fileWithPreview);
          }
        }
      });

      setErrors(newErrors);

      if (validFiles.length > 0) {
        const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
        setFiles(updatedFiles);
        onFilesSelected?.(validFiles);
      }
    };

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        processFiles(droppedFiles);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    };

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click();
      }
    };

    const removeFile = (fileId: string) => {
      setFiles((prev) => {
        const file = prev.find((f) => f.id === fileId);
        if (file?.preview) {
          URL.revokeObjectURL(file.preview);
        }
        return prev.filter((f) => f.id !== fileId);
      });
    };

    const updateFileProgress = (fileId: string, progress: number, status?: FileWithPreview["uploadStatus"], url?: string, error?: string) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                uploadProgress: progress,
                uploadStatus: status || f.uploadStatus,
                uploadedUrl: url || f.uploadedUrl,
                uploadError: error || f.uploadError,
              }
            : f
        )
      );
    };

    const clearFiles = () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
      setFiles([]);
      setErrors([]);
    };

    // Expose methods for parent component
    React.useImperativeHandle(
      ref,
      () => ({
        files,
        clearFiles,
        removeFile,
        updateFileProgress,
      }),
      [files]
    );

    const acceptString = Object.entries(accept)
      .map(([type, exts]) => [type, ...exts].join(","))
      .join(",");

    return (
      <div className={cn("w-full", className)}>
        {/* Drop Zone */}
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center w-full min-h-[200px] p-6",
            "border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
            "bg-muted/30 hover:bg-muted/50",
            isDragging && "border-primary bg-primary/5 scale-[1.02]",
            disabled && "opacity-50 cursor-not-allowed",
            !isDragging && !disabled && "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptString}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />

          {children || (
            <div className="flex flex-col items-center text-center">
              <div className={cn(
                "p-4 rounded-full mb-4 transition-colors",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}>
                <svg
                  className={cn(
                    "w-10 h-10 transition-colors",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1">
                {isDragging ? (
                  <span className="text-primary">Dosyaları buraya bırakın</span>
                ) : (
                  <>
                    <span className="text-primary">Dosya seçin</span>
                    <span className="text-muted-foreground"> veya sürükleyip bırakın</span>
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {Object.values(accept).flat().join(", ")} • Maks. {formatFileSize(maxSize)}
                {maxFiles > 1 && ` • En fazla ${maxFiles} dosya`}
              </p>
            </div>
          )}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
            {errors.map((error, i) => (
              <p key={i} className="text-sm text-destructive flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            ))}
          </div>
        )}

        {/* Preview Grid */}
        {showPreview && files.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">
                {files.length} dosya seçildi
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFiles();
                }}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Tümünü Kaldır
              </button>
            </div>
            <div
              className={cn(
                "grid gap-3",
                previewGridCols === 2 && "grid-cols-2",
                previewGridCols === 3 && "grid-cols-3",
                previewGridCols === 4 && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
                previewGridCols === 5 && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
                previewGridCols === 6 && "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
              )}
            >
              {files.map((file) => (
                <div
                  key={file.id}
                  className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
                >
                  {/* Image Preview */}
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Upload Progress Overlay */}
                  {file.uploadStatus === "uploading" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-3/4">
                        <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white transition-all duration-300"
                            style={{ width: `${file.uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-white text-xs text-center mt-1">
                          {file.uploadProgress}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Success Overlay */}
                  {file.uploadStatus === "success" && (
                    <div className="absolute top-1 right-1">
                      <div className="p-1 bg-green-500 rounded-full">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Error Overlay */}
                  {file.uploadStatus === "error" && (
                    <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center p-2">
                      <p className="text-white text-xs text-center">
                        {file.uploadError || "Yükleme hatası"}
                      </p>
                    </div>
                  )}

                  {/* Hover Info */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{file.name}</p>
                    <p className="text-white/70 text-[10px]">{formatFileSize(file.size)}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id!);
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Dropzone.displayName = "Dropzone";

// Export types for consumers
export type DropzoneRef = {
  files: FileWithPreview[];
  clearFiles: () => void;
  removeFile: (fileId: string) => void;
  updateFileProgress: (
    fileId: string,
    progress: number,
    status?: FileWithPreview["uploadStatus"],
    url?: string,
    error?: string
  ) => void;
};
