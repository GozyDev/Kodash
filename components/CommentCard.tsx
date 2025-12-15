import { Comment } from "@/lib/superbase/type";
import { Reply } from "lucide-react";
import React, { useState } from "react";
import { Textarea } from "./ui/textarea";

const formatTime = (date: string) =>
  new Date(date).toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });

const CommentCard = ({ comment }: { comment: Comment }) => {
  const [activeReply, setActiveReply] = useState<boolean>(false);
  return (
    <li className="rounded-xl border border-cardCB bg-cardICB/20 ">
      {/* Author row */}
      <div className="px-4 py-2 group">
        <div className="flex justify-between">
          <div className="flex items-center gap-3 ">
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
          <div className="">
            <div className="hidden group-hover:block bg-cardICB rounded-sm p-1">
              <Reply
                size={15}
                className="text-textNa "
                onClick={() => setActiveReply(!activeReply)}
              />
            </div>
          </div>
        </div>
        {/* Content */}
        <p className="mt-2 text-sm text-textNb leading-relaxed">
          {comment.content}
        </p>
      </div>

      {activeReply ? (
        <Textarea
          placeholder="Leave a reply..."
          className="bg-transparent border-transparent  border-t-cardCB p-3 text-sm"
        />
      ) : null}
    </li>
  );
};

export default CommentCard;
