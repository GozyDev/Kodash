"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useOrgIdStore } from "@/app/store/useOrgId";
import { useTaskStore } from "@/app/store/useTask";
import StatusCard from "./StatusCard";
import PriorityCard from "./piortyCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { LinkIcon, Loader2, MessageSquare, Plus } from "lucide-react";
import { Task } from "@/lib/superbase/type";
import useDebounce from "@/app/hooks/useDebounce";

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
  const [commentDraft, setCommentDraft] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [linkDraft, setLinkDraft] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
      console.log('runnunug')

      if (!title && !description) {
        console.log('ri')
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
        if (!res.ok) {
          throw new Error("Unable to load issue");
        }
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
  }, [issueId, orgId, setTask, tasks]);

  useEffect(() => {
    const refreshedIssue = tasks.find((t) => t.id === issueId);
    if (refreshedIssue) {
      setIssue(refreshedIssue);

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

    const descValue = debouncedDescription.trim() || null;
    if (descValue === issue.description) return;

    handleOptimisticDescription(issue.id, descValue);
  }, [debouncedDescription, issue]);

  const handleAddComment = () => {
    if (!commentDraft.trim()) return;
    setComments((prev) => [...prev, commentDraft.trim()]);
    setCommentDraft("");
  };

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
    <div className="p-6 text-textNb">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
        <div className="space-y-8">
          <header className="mb-6 space-y-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
              placeholder="Issue title..."
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              className="bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[60px] text-textNd "
            />
          </header>
          <section className="rounded-xl border border-cardCB bg-cardC p-4">
            <div className="flex items-center gap-2 text-textNd">
              <MessageSquare className="h-4 w-4" />
              <h3 className="text-sm font-medium">Comments</h3>
            </div>

            <div className="mt-3 space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-textNc">No comments yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-textNb">
                  {comments.map((comment, idx) => (
                    <li
                      key={`${comment}-${idx}`}
                      className="rounded-lg border border-cardCB/70 bg-cardICB/30 px-3 py-2"
                    >
                      {comment}
                    </li>
                  ))}
                </ul>
              )}

              <Textarea
                placeholder="Add a comment..."
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                className="bg-cardICB/20 border-0"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="butt"
                  onClick={handleAddComment}
                  disabled={!commentDraft.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add comment
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-textNd">
              Comments are kept local for now; persistence will be added later.
            </p>
          </section>
          <section className="rounded-xl border border-cardCB bg-cardC p-4">
            <div className="flex items-center gap-2 text-textNd">
              <LinkIcon className="h-4 w-4" />
              <h3 className="text-sm font-medium">Links</h3>
            </div>

            <div className="mt-3 space-y-3">
              {links.length === 0 ? (
                <p className="text-sm text-textNc">No links yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-primary underline">
                  {links.map((link, idx) => (
                    <li key={`${link}-${idx}`}>
                      <a href={link} target="_blank" rel="noreferrer">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="https://example.com"
                  value={linkDraft}
                  onChange={(e) => setLinkDraft(e.target.value)}
                  className="bg-cardICB/20"
                />
                <Button
                  size="sm"
                  className="butt"
                  onClick={handleAddLink}
                  disabled={!linkDraft.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add link
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-textNd">
              Links are stored locally for now; saving to the workspace will be
              added later.
            </p>
          </section>
        </div>

        <aside className="space-y-4">
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
