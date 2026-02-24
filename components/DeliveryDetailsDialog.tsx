"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { uploadFile } from "@/lib/upload";
import { X, Paperclip, Link2, Loader2 } from "lucide-react";
import Image from "next/image";

interface Attachment {
  id: string;
  file: File;
  preview: string;
  status?: "idle" | "uploading" | "failed" | "uploaded";
  file_id?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  abort?: () => void;
}

interface DeliveryLink {
  id: string;
  url: string;
  label: string;
}

interface DeliveryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    message: string;
    attachments: Attachment[];
    links: DeliveryLink[];
  }) => Promise<void>;
  loading?: boolean;
  taskTitle?: string;
}

const DeliveryDetailsDialog = ({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  taskTitle = "this task",
}: DeliveryDetailsDialogProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [links, setLinks] = useState<DeliveryLink[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    // Prevent duplicate selections by name+size
    const incoming = Array.from(files).filter(
      (f) =>
        !attachments.some(
          (a) => a.file.name === f.name && a.file.size === f.size,
        ),
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
      // Start uploads for newly added files
      arr.forEach((fileObj) => startUploadFile(fileObj.file, fileObj.id));
      return next;
    });
  };

  const startUploadFile = async (file: File, id: string) => {
    // Guard: don't start if already uploading or uploaded
    const existing = attachments.find((a) => a.id === id);
    if (
      existing &&
      (existing.status === "uploading" || existing.status === "uploaded")
    )
      return;

    setAttachments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "uploading" } : a,
      ),
    );

    const { promise, abort } = uploadFile(
      file,
      () => {
        // No progress tracking - just spinner
      },
      id,
    );

    // Store abort so caller can cancel
    setAttachments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, abort } : a)),
    );

    try {
      const res = await promise;
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "uploaded",
                file_id: res.file_id,
                file_url: res.file_url,
                file_name: res.file_name,
                file_size: file.size,
                abort: undefined,
              }
            : a,
        ),
      );
    } catch {
      setAttachments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "failed", abort: undefined } : a,
        ),
      );
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // Reset input so same file can be selected again
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

    // Cancel upload if running
    if (att.status === "uploading" && att.abort) {
      att.abort();
    }

    // Delete from server if uploaded
    if (att.status === "uploaded" && att.file_id) {
      await deleteFileOnServer(att.file_id);
    }

    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddLink = () => {
    if (!linkInput.trim()) return;

    // Basic URL validation
    try {
      new URL(linkInput);
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    setLinks((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        url: linkInput,
        label: linkLabel,
      },
    ]);

    setLinkInput("");
    setLinkLabel("");
  };

  const handleRemoveLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSubmit = async () => {
    if (!message.trim() && attachments.length === 0 && links.length === 0) {
      alert("Please provide at least a message, attachment, or link");
      return;
    }

    // Check if all attachments are uploaded
    const failedAttachments = attachments.filter((a) => a.status === "failed");
    const uploadingAttachments = attachments.filter(
      (a) => a.status === "uploading",
    );

    if (uploadingAttachments.length > 0) {
      alert("Please wait for all attachments to finish uploading");
      return;
    }

    if (failedAttachments.length > 0) {
      alert(
        "Some attachments failed to upload. Please remove them and try again.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        message,
        attachments: attachments.filter((a) => a.status === "uploaded"),
        links,
      });

      // Reset form on success
      setMessage("");
      setAttachments([]);
      setLinks([]);
      onOpenChange(false);
    } catch (error) {
      console.log("Failed to submit delivery details:", error);
      alert("Failed to submit delivery details. Please try again 9889.");
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = loading || submitting;

  return (
    <Dialog open={open} onOpenChange={(v) => !isDisabled && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[600px] bg-cardC text-textNa border-none border border-cardCB max-h-[90vh] overflow-y-auto overflow-x-hidden px-3 md:px-6">
        <DialogHeader>
          <DialogTitle>Deliver {taskTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Message textarea */}
          <div>
            <label className="text-sm font-medium text-textNb mb-2 block">
              Delivery Message
            </label>
            <Textarea
              placeholder="Describe what you're delivering and any relevant details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isDisabled}
              className="min-h-[120px] border-0 border-b-1 border-b-cardCB text-textNc placeholder:text-textNd text-sm tracking-widest rounded-none"
            />
          </div>

          {/* Attachments section */}
          <div>
            <button
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="bg-cardICB/50 rounded py-2 px-3 flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isDisabled}
              />
              <p className="text-sm">Attachment</p>
              <Paperclip className=" text-textNc" size={14} />
            </button>

            {/* Attachments list */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 p-2 bg-cardICB/20 rounded border border-cardCB"
                  >
                    {att.preview && (
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <Image
                          src={att.preview}
                          alt={att.file.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-textNa">
                        {att.file_name || att.file.name}
                      </p>

                      {att.status === "failed" && (
                        <p className="text-xs text-red-500 mt-1">
                          Upload failed
                        </p>
                      )}
                    </div>

                    {att.status === "uploading" && (
                      <Loader2 className="w-4 h-4 text-textNc animate-spin flex-shrink-0" />
                    )}
                    {att.status !== "uploading" && (
                      <button
                        onClick={() => handleRemoveAttachment(att.id)}
                        disabled={isDisabled}
                        className="flex-shrink-0 text-textNc hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links section */}
          <div>
            <label className="text-sm font-medium text-textNa mb-2 block">
              Links
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  disabled={isDisabled}
                  className="bg-cardICB/30 border-cardCB text-textNa placeholder:text-textNc"
                />
                <Input
                  placeholder="Link label (optional)"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  disabled={isDisabled}
                  className="bg-cardICB/30 border-cardCB text-textNa placeholder:text-textNc"
                />
                <Button
                  onClick={handleAddLink}
                  disabled={isDisabled || !linkInput.trim()}
                  className="bg-[#7c3aed] hover:bg-[#7c3aede8] flex-shrink-0"
                >
                  <Link2 size={16} />
                </Button>
              </div>

              {/* Links list */}
              {links.length > 0 && (
                <div className="space-y-1">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-2 p-2 bg-cardICB/20 rounded border border-cardCB"
                    >
                      <Link2 size={14} className="text-textNc flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-textNa">
                          {link.label}
                        </p>
                        <p className="text-xs text-textNc truncate">
                          {link.url}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveLink(link.id)}
                        disabled={isDisabled}
                        className="flex-shrink-0 text-textNc hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isDisabled}
            className="flex-1 bg-cardICB/50 hover:bg-cardICB/50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="flex-1 bg-[#7c3aed] hover:bg-[#7c3aede8] cursor-pointer"
          >
            {submitting || loading ? "Submitting..." : "Submit Delivery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryDetailsDialog;
