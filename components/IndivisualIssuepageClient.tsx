"use client";

import { useEffect, useMemo, useState } from "react";

import { useOrgIdStore } from "@/app/store/useOrgId";
import { useTaskStore } from "@/app/store/useTask";
import StatusCard from "./StatusCard";
import PriorityCard from "./piortyCard";
import { Input } from "./ui/input";
import { Loader2, Paperclip } from "lucide-react";
import { Task } from "@/lib/superbase/type";
import { presentToPast } from "@/lib/status";
import ProposalOverview from "./ProposalOverview";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import { RealtimeChannel } from "@supabase/supabase-js";

// Small helper component for description viewing/editing
function DescriptionViewer({
  text,
  limit = 300,
}: {
  text: string;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const needsToggle = useMemo(() => {
    return !!text && text.length > limit;
  }, [text, limit]);

  const truncated = useMemo(() => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) : text;
  }, [text, limit]);

  return (
    <div className="whitespace-pre-wrap text-sm text-textNd">
      <div>{expanded || !needsToggle ? text : `${truncated.trimEnd()}...`}</div>

      {needsToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((s) => !s);
          }}
          className="mt-2 text-sm text-textNc bg-cardC p-2  rounded cursor-pointer"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

export type Proposal = {
  id: string;
  price: number | string | null;
  currency: string | null;
  due_date: string | null;
  dod: string | null;
  status: "pending" | "canceled" | "accepted";
};

type Props = {
  orgId: string;
  issueId: string;
  userRole: "freelancer" | "client";
};

const IndivisualIssuepageClient = ({ orgId, issueId, userRole }: Props) => {
  const tasks = useTaskStore((state) => state.task);
  const setTask = useTaskStore((state) => state.setTask);
  const setOrgId = useOrgIdStore((state) => state.setOrgId);

  const [issue, setIssue] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [attachments, setAttachments] = useState<
    {
      file_url: string;
      file_type: string | null;
      file_size: number | null;
      file_name?: string | null;
    }[]
  >([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(true);

  // keep single-source state: `issue` drives all displayed values

  useEffect(() => {
    setOrgId(orgId);
  }, [orgId, setOrgId]);

  useEffect(() => {
    const existing = tasks.find((t) => t.id === issueId);
    if (existing) {
      setIssue(existing);
      setLoading(false);
      return;
    }

    const fetchIssue = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/task/${orgId}?id=${issueId}`);
        if (!res.ok) throw new Error("Unable to load issue");
        const data = await res.json();
        setIssue(data);
        if (
          data &&
          (tasks.length === 0 || !tasks.some((task) => task.id === data.id))
        ) {
          setTask([...tasks, data]);
        }
      } catch (error) {
        console.error(error);
        setIssue(null);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueId, orgId, setTask, tasks]);

  // Load attachments for this request (read-only)
  useEffect(() => {
    if (!issueId) return;
    let mounted = true;
    const fetchAttachments = async () => {
      setAttachmentsLoading(true);
      try {
        const res = await fetch(`/api/request_attachments/${issueId}`);
        if (!res.ok) {
          if (mounted) setAttachments([]);
          return;
        }
        const json = await res.json();
        if (mounted) setAttachments(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error(err);
        if (mounted) setAttachments([]);
      } finally {
        if (mounted) setAttachmentsLoading(false);
      }
    };

    fetchAttachments();

    return () => {
      mounted = false;
    };
  }, [issueId]);

  const handleOptimisticStatus = useTaskStore(
    (state) => state.handleOptimisticStatus,
  );

  // Fetch proposal for this issue on mount
  useEffect(() => {
    if (!issueId) return;

    const fetchProposal = async () => {
      try {
        const res = await fetch(`/api/proposal/${issueId}`);
        if (!res.ok) {
          console.error("Failed to load proposal");
          setProposal(null);
          return;
        }
        const json = await res.json();
        const proposalData = json.proposal || null;
        setProposal(proposalData);

        // If proposal exists and task status is draft, update to proposed
        if (proposalData) {
          const currentTask = tasks.find((t) => t.id === issueId);
          if (currentTask && currentTask.status === "draft") {
            // Use optimistic update to change status from draft to proposed (DB past-tense)
            const dbStatus = presentToPast("propose");
            handleOptimisticStatus(issueId, dbStatus as Task["status"]);
          }
        }
      } catch (err) {
        console.error(err);
        setProposal(null);
      }
    };

    fetchProposal();
  }, [issueId, tasks, handleOptimisticStatus]);

  useEffect(() => {
    const refreshedIssue = tasks.find((t) => t.id === issueId);
    if (refreshedIssue) {
      setIssue(refreshedIssue);
    }
  }, [issueId, tasks]);

  // Subscribe to realtime updates for this specific issue and update local/global state
  useEffect(() => {
    if (!issueId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      // 🔍 PROOF STEP — DO NOT SKIP
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("realtime user:", user?.id);

      if (!user) {
        console.error("❌ NO AUTH USER — REALTIME WILL NOT FIRE");
        return;
      }

      channel = supabase
        .channel(`issue-${issueId}`)

        // ---- TASK UPDATE ----
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "tasks",
            filter: `id=eq.${issueId}`,
          },
          (payload) => {
            const updated = payload.new as Task;

            setIssue(updated);

            const current = useTaskStore.getState().task;
            const exists = current.some((t) => t.id === updated.id);

            useTaskStore.setState({
              task: exists
                ? current.map((t) => (t.id === updated.id ? updated : t))
                : [updated, ...current],
            });

            console.log("issue updated via realtime:", updated.id);
          },
        )

        // ---- TASK DELETE ----
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "tasks",
            filter: `id=eq.${issueId}`,
          },
          (payload) => {
            const removed = payload.old as Task;

            setIssue(null);

            useTaskStore.setState({
              task: useTaskStore
                .getState()
                .task.filter((t) => t.id !== removed.id),
            });

            console.log("issue deleted via realtime:", removed.id);
          },
        )

        // ---- PROPOSAL INSERT ----
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "request_proposal",
            filter: `request_id=eq.${issueId}`,
          },
          (payload) => {
            const newProposal = payload.new as Proposal;
            setProposal(newProposal);

            if (newProposal?.status === "accepted") {
              const tasks = useTaskStore.getState().task;

              useTaskStore.setState({
                task: tasks.map((t) =>
                  t.id === issueId ? { ...t, status: "on-going" } : t,
                ),
              });
            }
          },
        )

        // ---- PROPOSAL UPDATE ----
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "request_proposal",
            filter: `request_id=eq.${issueId}`,
          },
          (payload) => {
            const updatedProposal = payload.new as Proposal;
            setProposal(updatedProposal);

            const tasks = useTaskStore.getState().task;

            useTaskStore.setState({
              task: tasks.map((t) =>
                t.id === issueId
                  ? {
                      ...t,
                      status:
                        updatedProposal.status === "accepted"
                          ? "on-going"
                          : updatedProposal.status === "canceled"
                            ? "cancel"
                            : t.status,
                    }
                  : t,
              ),
            });
          },
        )
        .subscribe((status) => console.log("Realtime status:", status));
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [issueId]);

  // No inline editing or debounced updates on this view-only page.

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <Image
          src="/Logo.png"
          alt="Kodash Logo"
          width={100}
          height={100}
          className="mb-5 animate-pulse"
        />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="p-6 text-textNb">
        <p className="text-lg font-semibold">Issue not found</p>
        <p className="text-textNc">Please check the link and try again.</p>
      </div>
    );
  }

  return (
    <div className=" text-textNb ">
      <div className="flex flex-col-reverse lg:grid gap-6 lg:grid-cols-[minmax(0,2fr)_200px]">
        <div className="space-y-6 pb-[20px] px-3 lg:px-6">
          <section className="flex flex-col gap-4 bg-cardICB/10 rounded">
            <div className="bg-cardC w-full h-[40px] rounded" />
            <header className="mb-6 space-y-4  rounded px-4">
             <p className="font-bold  uppercase tracking-wider">{issue.title}</p>
              <div>
                {/* Description display with expandable/collapsible behavior */}
                {/* Show Textarea for editing when focused; otherwise show truncated text with toggle */}
                {/** Local UI state manages expansion and edit mode */}
                <DescriptionViewer text={issue.description || ""} />
              </div>
            </header>
          </section>

          {/* <CommentSection issueId={issueId} /> */}

          <section className="py-4 space-y-10">
            <div className="mt-3">
              {attachmentsLoading ? (
                <div className="flex items-center gap-2 text-sm text-textNd">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading attachments...</span>
                </div>
              ) : attachments.length === 0 ? (
                <div className="text-sm text-textNc">No attachments.</div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {attachments.map((a, idx) => {
                    const isImage =
                      !!a.file_type && a.file_type.startsWith("image/");
                    return (
                      <li
                        key={`${a.file_url}-${idx}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => window.open(a.file_url, "_blank")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            window.open(a.file_url, "_blank");
                          }
                        }}
                        className="flex items-center justify-between bg-cardC/50 border border-cardCB rounded px-2 md:px-3 py-2 text-sm cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {isImage ? (
                            <div className="w-24 h-20 flex-shrink-0 bg-cardC/20 rounded overflow-hidden flex items-center justify-center">
                              <Image
                                src={a.file_url}
                                alt={a.file_name || "attachment"}
                                className="w-full h-full object-contain"
                                width={96}
                                height={80}
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 flex-shrink-0 bg-cardC/20 rounded flex items-center justify-center text-xs text-textNd">
                              <Paperclip />
                            </div>
                          )}

                          <div className="">
                            {" "}
                            {/* Ensures the container can shrink */}
                            <div className="w-full max-w-[200px]">
                              <p className=" truncate">{a.file_name || a.file_url}</p>
                            </div>
                            <div className="text-xs text-textNd">
                              {a.file_type ? `${a.file_type} • ` : ""}
                              {a.file_size !== null && a.file_size !== undefined
                                ? `${(a.file_size / 1024).toFixed(2)} KB`
                                : ""}
                            </div>
                          </div>
                        </div>

                        {/* Removed the explicit Open link. Clicking the item opens the file in a new tab. */}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* <div className="flex  items-center gap-3">
              <div className="flex items-center gap-2 text-textNd bg-cardC w-max py-1.5 px-5 rounded cursor-pointer">
                <LinkIcon className="h-3 w-3" />
                <h3 className="text-sm font-medium">Links</h3>
              </div>
              <div className="flex items-center gap-2 text-textNd bg-cardC w-max py-1.5 px-5 rounded cursor-pointer">
                <Paperclip className="h-3 w-3" />
                <h3 className="text-sm font-medium">Attachment</h3>
              </div>
            </div> */}
          </section>

          {/* Proposal */}
          {proposal ? (
            <ProposalOverview
              proposal={proposal}
              orgId={orgId}
              issueId={issueId}
            />
          ) : (
            <div className="rounded-xl border border-cardCB bg-cardC p-6">
              <p className="text-sm text-textNc">No proposal found.</p>
            </div>
          )}
        </div>

        <aside className="space-y-4  h-max p-4  lg:p-0 sticky top-[60px] right-[10px] flex md:flex-col items-center  border-b border-b-cardCB md:border-none gap-3 bg-bgPrimary/90 backdrop-blur-2xl">
          <section className="rounded border border-cardCB bg-cardC p-2 w-max md:w-full m-0">
            <div className="flex items-center justify-between">
              <p className=" capitalize ">{issue.status}</p>
              <StatusCard
                task={issue}
                status={issue.status}
                userRole={userRole}
              ></StatusCard>
            </div>
          </section>

          <section className="rounded border border-cardCB bg-cardC p-2 w-max md:w-full">
            <div className="flex items-start justify-between">
              <p className=" capitalize">{issue.priority}</p>
              <PriorityCard
                task={issue}
                priority={issue.priority}
              ></PriorityCard>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default IndivisualIssuepageClient;
