"use client";

import { ExternalLink } from "lucide-react";

interface Link {
  url: string;
  label: string;
}

interface DeliveryLinksProps {
  links: Link[];
}

export function DeliveryLinks({ links }: DeliveryLinksProps) {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      
      <div className="space-y-1  bg-cardC/50 p-2 rounded border border-cardCB">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded transition-colors group"
          >
            <ExternalLink size={14} className="text-textNc group-hover:text-green-400 transition-colors" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-textNc group-hover:text-green-400 truncate transition-colors">
                {link.label}
              </p>
              {link.url && (
                <p className="text-xs text-textNd truncate max-w-[400px]">
                  {link.url}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
