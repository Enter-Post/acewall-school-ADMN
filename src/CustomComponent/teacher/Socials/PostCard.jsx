import React, { useState } from "react";
import PostReactions from "./PostReactions";
import PostComments from "./PostComments";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { axiosInstance } from "@/lib/AxiosInstance";

const PostCard = ({ post, setPosts }) => {
  const [showComments, setShowComments] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const TEXT_LIMIT = 150;

  // ✅ Extract author info safely
  const author = post?.author || {};
  const authorName = `${author.firstName || ""} ${author.middleName || ""} ${
    author.lastName || ""
  }`.trim();

  const profilePic =
    author?.profileImg?.url ||
    author?.profileImg ||
    "https://i.pravatar.cc/100?img=10";

  const postTime = post?.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : "Just now";

  // ✅ Strip HTML from post.text
  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const text = stripHtml(post?.text || "");
  const assets = Array.isArray(post?.assets) ? post.assets : [];

  // ✅ Handle post deletion (matches backend API)
  const handleDeletePost = async () => {
    try {
      await axiosInstance.delete(`/posts/deletePost/${post._id}`);

      setPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 hover:shadow-md transition-all">
      {/* 🧑‍💻 Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <img
            src={profilePic}
            alt={authorName}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-[15px]">
              {authorName || "Unknown User"}
            </h3>
            <p className="text-xs text-gray-500">{postTime}</p>
          </div>
        </div>

        {/* 🗑️ Delete button */}
        <DeleteConfirmDialog onDelete={handleDeletePost} />
      </div>

      {/* 📝 Text */}
      {text && (
        <div className="text-gray-800 text-[14px] py-4 leading-relaxed whitespace-pre-line">
          {showFullText || text.length <= TEXT_LIMIT
            ? text
            : `${text.slice(0, TEXT_LIMIT)}...`}
          {text.length > TEXT_LIMIT && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="text-blue-600 text-sm ml-1 hover:underline"
            >
              {showFullText ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* 📸 Media */}
      {assets.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mt-2">
          {assets.map((asset, index) => {
            const isVideo =
              asset?.url?.endsWith(".mp4") || asset?.type?.includes("video");
            return isVideo ? (
              <video
                key={index}
                controls
                className="w-full rounded-lg max-h-[300px] object-cover"
              >
                <source src={asset.url} type="video/mp4" />
              </video>
            ) : (
              <img
                key={index}
                src={asset.url}
                alt={`Post media ${index}`}
                className="w-full rounded-lg object-contain max-h-[300px]"
              />
            );
          })}
        </div>
      )}

      {/* ❤️ Reactions + 💬 Comments */}
      <PostReactions
        post={post}
        setPosts={setPosts}
        onToggleComments={() => setShowComments((prev) => !prev)}
      />

      {/* 💬 Comments Section */}
      {showComments && <PostComments postId={post._id} setPosts={setPosts} />}
    </div>
  );
};

export default PostCard;
