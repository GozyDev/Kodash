"use client";

import Image from "next/image";
import { Paperclip } from "lucide-react";

function isImageFile(fileName: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf(".")) || "";
  return imageExtensions.includes(extension);
}

interface Attachment {
  file_id: string;
  file_url: string;
  file_name: string;
  file_size?: number;
}

interface DeliveryAttachmentsProps {
  attachments: Attachment[];
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown";
  
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export function DeliveryAttachments({ attachments }: DeliveryAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-textNb uppercase tracking-wider">
        Attachments
      </p>
      <div className="space-y-1">
        {attachments.map((attachment, idx) => (
          <a
            key={idx}
            href={attachment.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded hover:bg-bgPrimary/50 transition-colors group"
          >
            {isImageFile(attachment.file_name) ? (
              <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={attachment.file_url}
                  alt={attachment.file_name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <Paperclip className="w-4 h-4 text-textNc flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-textNc group-hover:text-blue-400 truncate transition-colors">
                {attachment.file_name}
              </p>
              <p className="text-xs text-textNd">
                {formatFileSize(attachment.file_size)}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
