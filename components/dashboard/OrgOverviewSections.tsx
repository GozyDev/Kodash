import StatusChart from "@/components/dashboard/StatusChart";

interface OrgOverviewSectionsProps {
  orgId: string;
}

export default function OrgOverviewSections({ orgId }: OrgOverviewSectionsProps) {
  return (
    <div className="space-y-6 p-4">
      <section className="rounded-xl border border-cardCB bg-cardC/70 p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-textNb">Overview</h2>
          <p className="text-sm text-textNd mt-1">
            Task status distribution for this workspace.
          </p>
        </div>
        <StatusChart orgId={orgId} />
      </section>

      <section className="rounded-xl border border-dashed border-cardCB bg-cardC/40 p-4 md:p-6">
        <h3 className="text-base font-medium text-textNb">Upcoming Sections</h3>
        <p className="text-sm text-textNd mt-1">
          This overview container is ready for additional sections like chats and
          summary widgets.
        </p>
      </section>
    </div>
  );
}
