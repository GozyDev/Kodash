"use client";

import { Download } from "lucide-react";

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
            <Download size={14} className="text-textNc group-hover:text-blue-400 transition-colors" />
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
