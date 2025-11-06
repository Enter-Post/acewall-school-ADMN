import React, { useState, useEffect, useContext, useRef } from "react";
import { Coffee } from "lucide-react";
import gsap from "gsap";
import PostCard from "@/CustomComponent/teacher/Socials/PostCard";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";

const SocialMain = ({ posts: externalPosts, setPosts: setExternalPosts }) => {
  const [localPosts, setLocalPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useContext(GlobalContext);

  const posts = externalPosts || localPosts;
  const setPosts = setExternalPosts || setLocalPosts;

  // Store refs to post DOM nodes for GSAP
  const postRefs = useRef({});

  // ✅ Fetch paginated posts
  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/posts/getPosts?page=${pageNum}&limit=10`);
      const fetched = response.data?.posts || [];

      const normalized = fetched.map((post) => ({
        _id: post._id,
        text: post.text || "",
        color: post.color || "#ffffff",
        assets: Array.isArray(post.assets) ? post.assets : [],
        author: {
          firstName: post?.author?.firstName || "Unknown",
          middleName: post?.author?.middleName || "",
          lastName: post?.author?.lastName || "",
          profileImg: post?.author?.profileImg?.url || "https://i.pravatar.cc/100?img=10",
        },
        createdAt: post.createdAt || new Date().toISOString(),
        likes: post.likes || [],
        comments: post.comments || [],
        liked: false,
      }));

      if (pageNum === 1) {
        setPosts(normalized);
      } else {
        // Append only new posts (avoid duplicates)
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const uniqueNew = normalized.filter((p) => !existingIds.has(p._id));
          return [...prev, ...uniqueNew];
        });
      }

      // If fewer than 10 posts were fetched, no more to load
      setHasMore(fetched.length === 10);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchPosts(1);
  }, []);

  // ✅ Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
          document.documentElement.offsetHeight &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  // ✅ Load more when page changes
  useEffect(() => {
    if (page > 1) fetchPosts(page);
  }, [page]);

  // ✅ Animate only NEW posts with GSAP
  const previousPostCount = useRef(0);
  useEffect(() => {
    const postElements = Object.values(postRefs.current).filter(Boolean);
    const newPosts = postElements.slice(previousPostCount.current);

    if (newPosts.length > 0) {
      gsap.fromTo(
        newPosts,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
        }
      );
    }

    previousPostCount.current = postElements.length;
  }, [posts]);

  return (
    <div className="min-h-screen bg-blue-300">
      {/* 🔝 Navbar */}
      <div className="bg-green-600 text-white rounded-lg shadow-sm sticky top-0 flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-3">
          <Coffee className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-wide">Spill The Tea</h1>
        </div>
      </div>

      {/* 🧾 Posts */}
      <div className="max-w-3xl mx-auto mt-6 space-y-4 px-2 sm:px-4 pb-10">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post._id}
              ref={(el) => {
                if (el) postRefs.current[post._id] = el;
              }}
            >
              <PostCard post={post} setPosts={setPosts} />
            </div>
          ))
        ) : loading ? (
          <div className="text-center text-gray-500 py-6">Loading posts...</div>
        ) : (
          <div className="text-center text-gray-500 py-6">No posts found</div>
        )}

        {loading && (
          <div className="text-center text-gray-500 py-6">Loading more posts...</div>
        )}
      </div>
    </div>
  );
};

export default SocialMain;
