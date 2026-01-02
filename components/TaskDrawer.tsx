// app/tasks/TaskDrawer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task, TaskInsert, TaskUpdate } from "@/lib/superbase/type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Save,
  Trash2,
  Maximize2,
  Minimize2,
  Circle,
  Minus,
  Mic,
  MoveUp,
  Check,
  Paperclip,
} from "lucide-react";
import { useTaskStore } from "@/app/store/useTask";
import { uploadFile } from "@/lib/upload";
import StatusCardCreate from "./StatusCardCreate";
import PriorityCardCreate from "./PriorityCardCreate";

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  initialStatus?: Task["status"]; // optional preset when creating
  userRole: "client" | "freelancer";
}

export default function TaskDrawer({
  task,
  isOpen,
  onClose,
  onDelete,
  initialStatus,
  userRole,
}: TaskDrawerProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "no priority" as Task["priority"],
    status: "to-do" as Task["status"],
    due_date: "",
  });

  console.log(formData);
  const handleCreateTask = useTaskStore((state) => state.handleCreateTask);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiParsedData, setAiParsedData] = useState<{
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    due_date?: string;
  } | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Attachments state & refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  type Attachment = {
    id: string;
    file: File;
    preview?: string;
    status?: "idle" | "uploading" | "failed" | "uploaded";
    progress?: number;
    file_id?: string;
    file_url?: string;
    abort?: () => void;
  };
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    // prevent duplicate selections by name+size
    const incoming = Array.from(files).filter((f) =>
      !attachments.some((a) => a.file.name === f.name && a.file.size === f.size)
    );

    const arr = incoming.map((f) => {
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file: f,
        preview: URL.createObjectURL(f),
        status: "idle",
        progress: 0,
      } as Attachment;
    });

    setAttachments((prev) => {
      const next = [...prev, ...arr];
      // start uploads for newly added
      arr.forEach((fileObj) => startUploadFile(fileObj.file, fileObj.id));
      return next;
    });
  };

  const startUploadFile = async (file: File, id: string) => {
    // guard: don't start if already uploading or uploaded
    const existing = attachments.find((a) => a.id === id);
    if (existing && (existing.status === "uploading" || existing.status === "uploaded")) return;

    setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "uploading", progress: 0 } : a)));

    const { promise, abort } = uploadFile(file, (p) => {
      // show progress internally but UI only shows spinner
      setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, progress: p } : a)));
    }, id);

    // store abort so caller can cancel
    setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, abort } : a)));

    try {
      const res = await promise;
      setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "uploaded", progress: 100, file_id: res.file_id, file_url: res.file_url, abort: undefined } : a)));
    } catch (err) {
      setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "failed", abort: undefined } : a)));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // reset input so same file can be selected again
    e.currentTarget.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const deleteFileOnServer = async (file_id?: string) => {
    if (!file_id) return;
    try {
      await fetch("/api/files/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id }),
      });
    } catch (e) {
      console.error("Failed to delete file on server", e);
    }
  };

  const handleRemoveAttachment = async (id: string) => {
    const att = attachments.find((a) => a.id === id);
    if (!att) return;

    // cancel upload if running
    if (att.status === "uploading" && att.abort) {
      try {
        att.abort();
      } catch {}
    }

    // if file already uploaded, delete from server
    if (att.file_id) {
      await deleteFileOnServer(att.file_id);
    } else {
      // If upload may have completed server-side but client didn't get response,
      // attempt to delete by the deterministic filename we used (clientId-file.name)
      const sanitized = att.file.name.replace(/\s+/g, "_");
      const candidate = `${att.id}-${sanitized}`;
      await deleteFileOnServer(candidate);
    }

    // cleanup preview and remove
    if (att.preview) URL.revokeObjectURL(att.preview);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      attachments.forEach((a) => {
        if (a.preview) URL.revokeObjectURL(a.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = async () => {
    // cancel and delete any uploaded or uploading attachments
    const list = [...attachments];
    for (const att of list) {
      if (att.status === "uploading" && att.abort) {
        try {
          att.abort();
        } catch {}
      }
      if (att.file_id) {
        try {
          await deleteFileOnServer(att.file_id);
        } catch (e) {
          console.error("Failed to delete during close", e);
        }
      } else {
        const sanitized = att.file.name.replace(/\s+/g, "_");
        const candidate = `${att.id}-${sanitized}`;
        try {
          await deleteFileOnServer(candidate);
        } catch (e) {
          console.error("Failed to delete candidate during close", e);
        }
      }
      if (att.preview) URL.revokeObjectURL(att.preview);
    }

    setAttachments([]);
    onClose();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        due_date: task.due_date || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "no priority",
        status: initialStatus || "to-do",
        due_date: "",
      });
    }
    // Reset expand state when modal opens/closes
    if (!isOpen) {
      setIsExpanded(false);
      setAiInput("");
      setAiParsedData(null);
    }
  }, [task, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  const handleDelete = () => {
    setIsDeleting(true);
    if (!onDelete) {
      return;
    }
    try {
      onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAcceptAI = () => {
    if (!aiParsedData) return;

    // Merge AI-generated data into formData
    setFormData((prev) => ({
      ...prev,
      title: aiParsedData.title || prev.title,
      description: aiParsedData.description || prev.description,
      priority: (aiParsedData.priority as Task["priority"]) || prev.priority,
      status: (aiParsedData.status as Task["status"]) || prev.status,
      due_date: aiParsedData.due_date || prev.due_date,
    }));

    // Clear the AI parsed data after accepting
    setAiParsedData(null);
  };

  const isAnyUploading = attachments.some((a) => a.status === "uploading");
  const uploadedAttachments = attachments
    .filter((a) => a.status === "uploaded" && a.file_url)
    .map((a) => ({
      file_url: a.file_url as string,
      file_type: a.file.type,
      file_size: a.file.size,
    }));

  const handleSendAI = async () => {
    if (!aiInput.trim() || isSending) return;

    setIsSending(true);
    setAiParsedData(null);

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: aiInput }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        try {
          // Parse the JSON response
          const parsed = JSON.parse(data.data);

          // Normalize the values to match formData format
          let normalizedStatus = parsed.status?.toLowerCase().trim() || "to-do";
          // Handle various status formats: "to-do", "todo", "in progress", "in-progress", "done"
          if (
            normalizedStatus.includes("todo") ||
            normalizedStatus === "to-do"
          ) {
            normalizedStatus = "to-do";
          } else if (
            normalizedStatus.includes("progress") ||
            normalizedStatus === "in-progress"
          ) {
            normalizedStatus = "in-progress";
          } else if (normalizedStatus === "done") {
            normalizedStatus = "done";
          } else {
            normalizedStatus = "to-do";
          }

          let normalizedPriority =
            parsed.priority?.toLowerCase().trim() || "medium";
          // Ensure priority is one of: high, medium, low
          if (!["high", "medium", "low"].includes(normalizedPriority)) {
            normalizedPriority = "medium";
          }

          const normalizedData = {
            title: parsed.title || "",
            description: parsed.description || "",
            priority: normalizedPriority,
            status: normalizedStatus,
            due_date: parsed.due_date || "",
          };

          setAiParsedData(normalizedData);
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
          setAiParsedData({ title: "Error: Failed to parse response" });
        }
      } else {
        setAiParsedData({
          title: `Error: ${data.error || "Failed to get response"}`,
        });
      }
    } catch (error) {
      setAiParsedData({
        title: `Error: ${
          error instanceof Error ? error.message : "Failed to send request"
        }`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "to-do":
        return <Circle className="w-3.5 h-3.5" />;
      case "in-progress":
        return <Minus className="w-3.5 h-3.5 rotate-90" />;
      case "done":
        return <Circle className="w-3.5 h-3.5 fill-current" />;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "to-do":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20";
      case "done":
        return "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Centered Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                height: isExpanded ? "90vh" : "auto",
              }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-2xl bg-cardC  rounded-lg shadow-2xl pointer-events-auto border border-cardCB flex flex-col  ${
                isExpanded ? "h-[90vh]" : "max-h-[85vh]"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-cardCB/80">
                <div className="flex items-center gap-2 text-sm text-textNd">
                  <span className="text-textNb">New issue</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-7 w-7 p-0 text-textNd hover:text-textNb hover:bg-bgPrimary/30"
                  >
                    {isExpanded ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-7 w-7 p-0 text-textNd hover:text-textNb hover:bg-bgPrimary/30"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div
                className={`flex-1 overflow-y-auto px-5 py-4 ${
                  isExpanded ? "min-h-0" : ""
                }`}
              >
                {/* Title - No border, just placeholder */}
                <div className="mb-4">
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Issue title"
                    disabled={userRole === "freelancer" && task !== null}
                    readOnly={userRole === "freelancer" && task !== null}
                    className="text-base font-medium border-0 bg-transparent focus:outline-none px-0 py-1 placeholder:text-textNd h-auto"
                    autoFocus
                  />
                </div>

                {/* Description - No border */}
                <div className="mb-6">
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Add description..."
                    rows={isExpanded ? 20 : 6}
                    className="resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-1 placeholder:text-textNd text-sm min-h-[100px]"
                    disabled={userRole === "freelancer" && task !== null}
                    readOnly={userRole === "freelancer" && task !== null}
                  />
                </div>

                {/* Attachments - optional */}
                <div className="mb-6">
                  {/* <label className="text-xs text-textNd mb-2 block">
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-textNd bg-cardICB/50 w-max py-1.5 px-5 rounded cursor-pointer"
                    >
                      <Paperclip className="h-3 w-3" />
                      <h3 className="text-sm font-medium">Attachment</h3>
                    </div>
                  </label> */}

                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className=""
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,image/png,image/jpeg"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                    <div className="flex items-center gap-2 text-textNd bg-cardICB/50 w-max py-1.5 px-5 rounded cursor-pointer">
                      <Paperclip className="h-3 w-3" />
                      <h3 className="text-sm font-medium">Attachment</h3>
                    </div>
                  </div>

                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((att, idx) => {
                        const file = att.file;
                        const isImage = file.type.startsWith("image/");

                        if (isImage) {
                          return (
                            <div
                              key={att.id}
                              className="flex items-center justify-between bg-cardC/50 border border-cardCB rounded px-3 py-2 text-sm"
                            >
                              <div
                                onClick={() =>
                                  att.preview &&
                                  window.open(att.preview, "_blank")
                                }
                                className="flex items-center gap-3 truncate cursor-pointer"
                                role="button"
                                aria-label={`Open ${file.name} in new tab`}
                              >
                                <div className="w-24 h-20 flex-shrink-0 bg-cardC/20 rounded overflow-hidden flex items-center justify-center">
                                  <img
                                    src={att.preview}
                                    alt={file.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="truncate">
                                  <div className="font-medium text-textNb truncate">
                                    {file.name}
                                  </div>
                                  <div className="text-xs text-textNd">
                                    {formatBytes(file.size)}
                                  </div>
                                  {att.status === "uploading" && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                                      <span className="text-xs text-textNd">Uploading...</span>
                                    </div>
                                  )}
                                  {att.status === "failed" && (
                                    <div className="text-xs text-red-400 mt-1">Failed to upload</div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveAttachment(att.id);
                                  }}
                                  className="h-7 w-7 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={att.id}
                            className="flex items-center justify-between bg-cardC/50 border border-cardCB rounded px-3 py-2 text-sm"
                          >
                            <div
                              onClick={() =>
                                att.preview &&
                                window.open(att.preview, "_blank")
                              }
                              className="truncate mr-3 cursor-pointer"
                              role="button"
                              aria-label={`Open ${file.name} in new tab`}
                            >
                              <div className="font-medium text-textNb truncate">
                                {file.name}
                              </div>
                              <div className="text-xs text-textNd">
                                {formatBytes(file.size)}
                              </div>
                              {att.status === "uploading" && (
                                <div className="flex items-center gap-2 mt-1"><span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" /></div>
                              )}
                              {att.status === "failed" && (
                                <div className="text-xs text-red-400 mt-1">Failed to upload</div>
                              )}
                            </div>
                            <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveAttachment(att.id);
                                }}
                                className="h-7 w-7 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="bg-primaryHC/10 h-auto border border-cardCB focus:outline-none px-3 py-1 rounded-md relative">
                    <Input
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendAI();
                        }
                      }}
                      placeholder="Task with AI Assistant"
                      className="text-base font-medium placeholder:text-textNd focus:outline-none pr-20"
                      disabled={isSending}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <div className="w-7 h-7 bg-white/80 flex items-center justify-center rounded-full cursor-pointer hover:bg-white">
                        <Mic size={17} className="text-black" />
                      </div>
                      <button
                        onClick={handleSendAI}
                        disabled={!aiInput.trim() || isSending}
                        className="w-7 h-7 bg-white/80 flex items-center justify-center rounded-full cursor-pointer hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      >
                        <MoveUp size={17} className="text-black" />
                      </button>
                    </div>
                  </div>

                  {isSending && (
                    <div className="mt-3 p-3 bg-cardCB/50 border border-cardCB rounded-md">
                      <div className="text-sm text-textNd">Sending...</div>
                    </div>
                  )}

                  {aiParsedData && !isSending && (
                    <div className="mt-3 p-4 bg-cardCB/50 border border-cardCB rounded-md space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-textNd font-medium">
                          AI Generated Task:
                        </div>
                        <Button
                          onClick={handleAcceptAI}
                          size="sm"
                          className="h-7 px-3 text-xs butt"
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Accept
                        </Button>
                      </div>

                      {aiParsedData.title && (
                        <div>
                          <label className="text-xs text-textNd mb-1 block">
                            Title
                          </label>
                          <div className="text-sm text-textNb bg-cardC/50 border border-cardCB rounded px-3 py-2">
                            {aiParsedData.title}
                          </div>
                        </div>
                      )}

                      {aiParsedData.description && (
                        <div>
                          <label className="text-xs text-textNd mb-1 block">
                            Description
                          </label>
                          <div className="text-sm text-textNb bg-cardC/50 border border-cardCB rounded px-3 py-2 min-h-[60px] whitespace-pre-wrap">
                            {aiParsedData.description}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {aiParsedData.priority && (
                          <div>
                            <label className="text-xs text-textNd mb-1 block">
                              Priority
                            </label>
                            <div className="text-sm text-textNb bg-cardC/50 border border-cardCB rounded px-3 py-2 capitalize">
                              {aiParsedData.priority}
                            </div>
                          </div>
                        )}

                        {aiParsedData.status && (
                          <div>
                            <label className="text-xs text-textNd mb-1 block">
                              Status
                            </label>
                            <div className="text-sm text-textNb bg-cardC/50 border border-cardCB rounded px-3 py-2 capitalize">
                              {aiParsedData.status === "to-do"
                                ? "Todo"
                                : aiParsedData.status === "in-progress"
                                ? "In Progress"
                                : "Done"}
                            </div>
                          </div>
                        )}
                      </div>

                      {aiParsedData.due_date && (
                        <div>
                          <label className="text-xs text-textNd mb-1 block">
                            Due Date
                          </label>
                          <div className="text-sm text-textNb bg-cardC/50 border border-cardCB rounded px-3 py-2">
                            {aiParsedData.due_date}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Status & Priority Row - Button style like Linear */}
                <div className="flex items-center gap-2 flex-wrap border-t border-cardCB/80 pt-4 abosolute bottom-0 w-full">
                  {/* Status */}
                  <div>
                    <StatusCardCreate
                      handleChange={handleChange}
                      status={formData.status}
                    ></StatusCardCreate>
                  </div>

                  {/* Priority */}
                  <div>
                    <PriorityCardCreate
                      handleChange={handleChange}
                      priority={formData.priority}
                    ></PriorityCardCreate>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-cardCB/50 bg-bgPrimary/10">
                <div>
                  {onDelete && userRole === "client" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="h-7 text-xs text-red-400 border-red-800/30 hover:bg-red-950/20 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-7 px-3 text-xs text-textNd hover:text-textNb hover:bg-bgPrimary/30"
                  >
                    Cancel
                  </Button>
                  {userRole === "client" && (
                    <Button
                      onClick={() =>
                        handleCreateTask({ ...formData, attachments: uploadedAttachments })
                      }
                      disabled={!formData.title.trim() || isSaving || isAnyUploading}
                      className="h-7 px-3 text-xs butt"
                    >
                      {task
                        ? isSaving
                          ? "Saving..."
                          : "Save"
                        : isSaving
                        ? "Creating..."
                        : "Create issue"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
