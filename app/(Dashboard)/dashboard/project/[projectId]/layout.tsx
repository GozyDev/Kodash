import { AppSidebar } from "@/components/AppSidebar";
import ProjectHeader from "@/components/ProjectHeader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/superbase/superbase-server";

// Next.js layout signature — params is an object, not a Promise
const ProjectLayout = async ({
  params,
  children,
}: {
  params: { projectId: string };
  children: React.ReactNode;
}) => {
  const { projectId } = params;
  const supabase = await createClient();

  const { data: orgs, error: orgsError } = await supabase
    .from("tenants")
    .select("id, name, plan");

  if (orgsError) {
    console.error("Error fetching orgs", orgsError.message);
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("*, tenant_id(id,name,plan,type,created_at, projects(id,title))") // nested projects
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("Error fetching project", error.message);
  }

  if (!project) return <div>Project not found</div>;

  return (
    <SidebarProvider>
      <ProjectHeader orgs={orgs ?? []} project={project} />
      <div className="text-textNa flex w-full">
        <aside>
          <AppSidebar project_id ={projectId} />
        </aside>
        <main className=" flex-1 pt-[74px]">
          <div className="flex w-full">
            <SidebarTrigger/>
            <div className="flex-1">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProjectLayout;
