"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useOrgIdStore } from "@/app/store/useOrgId";
import { useTaskStore } from "@/app/store/useTask";
import StatusCard from "./StatusCard";
import PriorityCard from "./piortyCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  LinkIcon,
  Loader2,
  MessageSquare,
  Paperclip,
  Plus,
} from "lucide-react";
import { Task, Comment } from "@/lib/superbase/type";
import useDebounce from "@/app/hooks/useDebounce";
import CommentSection from "./CommentSection";
import ProposalOverview from "./ProposalOverview";
import { Textarea } from "./ui/textarea";

// Small helper component for description viewing/editing
function DescriptionViewer({
  text,
  onChange,
  limit = 300,
  editable = true,
}: {
  text: string;
  onChange: (v: string) => void;
  limit?: number;
  editable?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const needsToggle = useMemo(() => {
    return text && text.length > limit;
  }, [text, limit]);

  const truncated = useMemo(() => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) : text;
  }, [text, limit]);

  return (
    <div>
      {isEditing ? (
        <Textarea
          value={text}
          onChange={(e: any) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
          className="bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[60px] text-textNd"
        />
      ) : (
        <div
          className="whitespace-pre-wrap text-sm text-textNd"
          onClick={() => editable && setIsEditing(true)}
        >
          <div>
            {expanded || !needsToggle ? text : `${truncated.trimEnd()}...`}
          </div>

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
};

type Props = {
  orgId: string;
  issueId: string;
};

const IndivisualIssuepageClient = ({ orgId, issueId }: Props) => {
  const tasks = useTaskStore((state) => state.task);
  const setTask = useTaskStore((state) => state.setTask);
  const setOrgId = useOrgIdStore((state) => state.setOrgId);

  const [issue, setIssue] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const [linkDraft, setLinkDraft] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

  const handleOptimisticTitle = useTaskStore(
    (state) => state.handleOptimisticTitle
  );
  const handleOptimisticDescription = useTaskStore(
    (state) => state.handleOptimisticDescription
  );

  // Debounce refs
  const debouncedTitle = useDebounce(title, 500);
  const debouncedDescription = useDebounce(description, 500);

  useEffect(() => {
    setOrgId(orgId);
  }, [orgId, setOrgId]);

  useEffect(() => {
    const existing = tasks.find((t) => t.id === issueId);
    if (existing) {
      setIssue(existing);
      if (!title && !description) {
        setTitle(existing.title);
        setDescription(existing.description || "");
      }
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
        if (!title && !description) {
          setTitle(data.title);
          setDescription(data.description || "");
        }
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
  }, [issueId, orgId, setTask, tasks, title, description]);

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
    (state) => state.handleOptimisticStatus
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
            // Use optimistic update to change status from draft to proposed
            handleOptimisticStatus(issueId, "proposed");
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
      console.log("runnnng");
      console.log(refreshedIssue.title);
      console.log(title);

      // Only sync local state if user is not actively editing
      if (refreshedIssue.title !== title) {
        setTitle(refreshedIssue.title);
        console.log("setting title");
      }
      if ((refreshedIssue.description || "") !== description) {
        setDescription(refreshedIssue.description || "");
      }
    }
  }, [issueId, tasks]);

  // Debounced title update
  useEffect(() => {
    if (!issue) return;
    if (!debouncedTitle.trim()) return;
    if (issue.title === debouncedTitle) return;
    handleOptimisticTitle(issue.id, debouncedTitle.trim());
  }, [debouncedTitle, issue]);

  // Debounced description update
  useEffect(() => {
    if (!issue) return;
    if (!debouncedDescription) return;
    const descValue = debouncedDescription.trim() || null;
    if (descValue === issue.description) return;

    handleOptimisticDescription(issue.id, descValue);
  }, [debouncedDescription, issue]);

  const handleAddLink = () => {
    if (!linkDraft.trim()) return;
    setLinks((prev) => [...prev, linkDraft.trim()]);
    setLinkDraft("");
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-textNd" />
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
    <div className=" text-textNb">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
        <div className="space-y-8 pb-6 px-6">
          <div className="bg-cardC w-full h-[40px]"></div>
          <header className="mb-6 space-y-6 rounded">
            <Input
              value={title}
              readOnly
              className="text-xl font-semibold bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
              placeholder="Issue title..."
            />
            <div>
              {/* Description display with expandable/collapsible behavior */}
              {/* Show Textarea for editing when focused; otherwise show truncated text with toggle */}
              {/** Local UI state manages expansion and edit mode */}
              <DescriptionViewer
                text={description}
                onChange={(v: string) => setDescription(v)}
                editable={false}
              />
            </div>
          </header>

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
                        className="flex items-center justify-between bg-cardC/50 border border-cardCB rounded px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-3 truncate">
                          {isImage ? (
                            <div className="w-24 h-20 flex-shrink-0 bg-cardC/20 rounded overflow-hidden flex items-center justify-center">
                              <img
                                src={a.file_url}
                                alt={a.file_name || "attachment"}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-20 flex-shrink-0 bg-cardC/20 rounded flex items-center justify-center text-xs text-textNd">
                              <Paperclip />
                            </div>
                          )}

                          <div className="truncate">
                            <div className="font-medium text-textNb truncate">
                              {a.file_name || a.file_url}
                            </div>
                            <div className="text-xs text-textNd">
                              {a.file_type ? `${a.file_type} • ` : ""}
                              {a.file_size !== null && a.file_size !== undefined
                                ? `${(a.file_size / 1024).toFixed(2)} KB`
                                : ""}
                            </div>
                          </div>
                        </div>

                        <div>
                          <a
                            href={a.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline text-sm"
                          >
                            Open
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex  items-center gap-3">
              <div className="flex items-center gap-2 text-textNd bg-cardC w-max py-1.5 px-5 rounded cursor-pointer">
                <LinkIcon className="h-3 w-3" />
                <h3 className="text-sm font-medium">Links</h3>
              </div>
              <div className="flex items-center gap-2 text-textNd bg-cardC w-max py-1.5 px-5 rounded cursor-pointer">
                <Paperclip className="h-3 w-3" />
                <h3 className="text-sm font-medium">Attachment</h3>
              </div>
            </div>
          </section>

          {/* Proposal */}
          {proposal ? (
            <ProposalOverview proposal={proposal} orgId={orgId} />
          ) : (
            <div className="rounded-xl border border-cardCB bg-cardC p-6">
              <p className="text-sm text-textNc">No proposal found.</p>
            </div>
          )}
        </div>

        <aside className="space-y-4  h-max sticky top-[100px]">
          <section className="rounded-xl border border-cardCB bg-cardC p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-textNd">
                  Status
                </p>
                <p className="text-sm text-textNc">
                  Track where this issue is right now.
                </p>
              </div>
              <StatusCard task={issue} status={issue.status}></StatusCard>
            </div>
          </section>

          <section className="rounded-xl border border-cardCB bg-cardC p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-textNd">
                  Priority
                </p>
                <p className="text-sm text-textNc">
                  Set priority to organize the backlog.
                </p>
              </div>
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
