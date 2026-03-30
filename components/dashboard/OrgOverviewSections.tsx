import StatusChart from "@/components/dashboard/StatusChart";
import OverviewStats from "@/components/dashboard/OverviewStats";
import { createClient } from "@/lib/superbase/superbase-server";

interface OrgOverviewSectionsProps {
  orgId: string;
}

export default async function OrgOverviewSections({
  orgId,
}: OrgOverviewSectionsProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const user = data?.user;
  const displayName =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "User");

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-2xl font-bold text-textNc">Welcome, {displayName}</h2>
      </div>
      <OverviewStats orgId={orgId} />

      <section className="rounded-xl border-cardCB  bg-cardC/30 p-4 md:p-6">
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
