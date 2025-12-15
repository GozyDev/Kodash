import { MessageSquare, Plus, Reply } from "lucide-react";
import React, { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Comment } from "@/lib/superbase/type";
import CommentCard from "./CommentCard";



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
        <p className="text-sm text-textNc">
          No comments yet. <MessageSquare />
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
           <CommentCard key={comment.id} comment={comment}/>
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
