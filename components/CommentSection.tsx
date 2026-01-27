import { MessageSquare, Plus,Upload, File, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Comment } from "@/lib/superbase/type";
import CommentCard from "./CommentCard";
import Image from "next/image";

const CommentSection = ({ issueId }: { issueId: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentDraft, setCommentDraft] = useState<string>("");
  const [loadComment, setLoadComment] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  console.log(comments)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  useEffect(() => {
    if (!issueId) return;
    const fetchComments = async () => {
      setLoadComment(true);
      try {
        const res = await fetch(`/api/comment?issueId=${encodeURIComponent(issueId)}`);
        const data = await res.json();
        // API might return { comments: [] } or an array
        setComments(data?.comments ?? data ?? []);
      } catch (err) {
        console.error(err);
        setComments([]);
      } finally {
        setLoadComment(false);
      }
    };

    fetchComments();
  }, [issueId]);

  const handleAddComment = async () => {
    if (!commentDraft.trim()) return;
    if (!issueId) return;
  
    try {
      setUploading(true);

      const form = new FormData();
      form.append("commentDraft", commentDraft);
      form.append("issueId", issueId);
      if (file) form.append("file", file);

      const res = await fetch("/api/comment", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Failed to post comment", err);
        return;
      }

      const data = await res.json();
      const created = data?.comment ?? data;
      setComments((prev) => [...prev, created]);
      setCommentDraft("");

      // clear file and preview
      setFile(null);
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error("upload or post failed", err);
    } finally {
      setUploading(false);
    }
  };

  function formatBytes(bytes: number): string {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  console.log(file);
  const handleUpload = () => {
    fileRef.current?.click();
  };
  return (
    <section className="space-y-4">
      {/* Header */}

      {/* Comments */}
      {loadComment ? (
        <p className="text-[10px] text-textNd">Loading Comment</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-textNc">
          No comments yet. <MessageSquare />
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </ul>
      )}

      {/* Input */}
      <div className="relative bg-cardICB/20 p-4 flex flex-col gap-5  rounded-xl">
        {/* File Display */}
        {file && (
          <div>
            <div className="bg-cardICB/30 px-3 py-4 rounded-xl flex items-center justify-between gap-3 relative">
              <div className="flex-1 flex items-center gap-3">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={file.name}
                    className=" rounded-md object-contain "
                  />
                ) : (
                  <div className="w-full flex gap-3 items-center">
                    <File size={20} className="text-textNd" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm">{file.name}</p>
                      <p className="text-[12px] text-textNd font-medium">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute top-0 right-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  <X />
                </Button>
              </div>
            </div>
          </div>
        )}

        <Textarea
          placeholder="Leave a comment..."
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          className=" border-none p-3  text-sm"
        />

        <div className=" flex gap-2 justify-end ">
          <div className="">
            <input
              type="file"
              hidden
              ref={fileRef}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button
              size="sm"
              className="bg-cardICB/50 flex h-8 w-8 items-center justify-center rounded-full p-0"
              onClick={handleUpload}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          <div className="">
            <Button
              size="sm"
              className="butt flex h-8 w-8 items-center justify-center rounded-full p-0"
              onClick={handleAddComment}
              disabled={!commentDraft.trim() || uploading}
            >
              {uploading ? "..." : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommentSection;
