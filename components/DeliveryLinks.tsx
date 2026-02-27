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
            /* Added overflow-hidden and w-full here */
            className="flex items-center gap-2 p-2 rounded transition-colors group w-full overflow-hidden"
          >
            <ExternalLink
              size={14}
              /* Added shrink-0 to prevent the icon from squishing */
              className="text-textNc group-hover:text-green-400 transition-colors shrink-0"
            />

            {/* Stripped md:w-full and added min-w-0 + w-full */}
            <div className="flex-1 min-w-0 w-full">
              <p className="text-sm text-textNc group-hover:text-green-400 truncate transition-colors">
                {link.label}
              </p>
              {link.url && (
                <p className="text-xs text-textNd truncate w-full max-w-[200px] md:max-w-[300px]">
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
