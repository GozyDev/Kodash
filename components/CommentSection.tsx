import { MessageSquare, Plus } from "lucide-react";
import React from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

const CommentSection = ({
  comments,
  commentDraft,
  setCommentDraft,
  handleAddComment,
}: {
  comments: string[];
  commentDraft: string;
  setCommentDraft: (value: string) => void;
  handleAddComment: () => void;
}) => {
  return (
    <section className="">
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

        <div className="relative ">
          <Textarea
            placeholder="Leave a comment"
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            className=" bg-cardICB/20 rounded-xl border-cardCB tracking-widest leading-[30px] p-3 pb-10"
          />
          <div className="flex justify-end absolute bottom-2 right-2">
            <Button
              size="sm"
              className="butt flex items-center justify-center rounded-full p-0 w-[30px] h-[30px]"
              onClick={handleAddComment}
              disabled={!commentDraft.trim()}
            >
              <Plus className=" h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommentSection;
