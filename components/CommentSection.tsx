import { MessageSquare, Plus } from "lucide-react";
import React from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Comment } from "@/lib/superbase/type";

const formatTime = (date: string) =>
  new Date(date).toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });

const CommentSection = ({
  comments,
  commentDraft,
  setCommentDraft,
  handleAddComment,
  loadComment,
}: {
  comments: Comment[];
  commentDraft: string;
  setCommentDraft: (value: string) => void;
  handleAddComment: () => void;
  loadComment: boolean;
}) => {
  return (
    <section className="space-y-4">
      {/* Header */}

      {/* Comments */}
      {loadComment ? (
        <p className="text-[10px] text-textNd">Loading Comment</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-textNc">No comments yet. <MessageSquare/></p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-cardCB bg-cardICB/20 px-4 py-2"
            >
              {/* Author row */}
              <div className="flex items-center gap-3">
                <img
                  src={comment.author?.avatar_url || "/avatar-placeholder.png"}
                  alt={comment.author?.full_name}
                  className="h-8 w-8 rounded-full object-cover"
                />

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-textNb">
                    {comment.author?.full_name}
                  </span>
                  <span className="text-xs text-textNc">
                    {formatTime(comment.created_at)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <p className="mt-2 text-sm text-textNb leading-relaxed">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Input */}
      <div className="relative">
        <Textarea
          placeholder="Leave a comment..."
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          className="bg-cardICB/20 rounded-xl border-cardCB p-3 pb-15 text-sm"
        />

        <div className="absolute bottom-2 right-2">
          <Button
            size="sm"
            className="butt flex h-8 w-8 items-center justify-center rounded-full p-0"
            onClick={handleAddComment}
            disabled={!commentDraft.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommentSection;
