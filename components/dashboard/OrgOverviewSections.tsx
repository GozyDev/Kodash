import StatusChart from "@/components/dashboard/StatusChart";
import OverviewStats from "@/components/dashboard/OverviewStats";

interface OrgOverviewSectionsProps {
  orgId: string;
}

export default function OrgOverviewSections({
  orgId,
}: OrgOverviewSectionsProps) {
  return (
    <div className="space-y-6 p-4">
      <OverviewStats orgId={orgId} />

      <section className="rounded-xl border-cardCB  bg-cardC/50 p-4 md:p-6">
        <div className="mb-4">
          <p className="text-md text-textNd mt-1">
            Task status distribution for this workspace.
          </p>
        </div>
        <StatusChart orgId={orgId} />
      </section>

      {/* <section className="rounded-xl border border-dashed border-cardCB bg-cardC/40 p-4 md:p-6">
        <h3 className="text-base font-medium text-textNb">Upcoming Sections</h3>
        <p className="text-sm text-textNd mt-1">
          This overview container is ready for additional sections like chats
          and summary widgets.
        </p>
      </section> */}
    </div>
  );
}
