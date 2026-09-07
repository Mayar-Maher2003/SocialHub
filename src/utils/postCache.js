// Shared React Query cache helpers for Post CRUD.
// Keeps every cached post list/detail in sync with the backend response
// after create/update/delete, without forcing a full page refresh.

const POST_LIST_QUERY_KEYS = ["all-posts", "profile-posts", "my-bookmarks", "user.posts"];

function getId(item) {
  return item?._id || item?.id;
}

function isPostListQuery(query) {
  return POST_LIST_QUERY_KEYS.includes(query.queryKey[0]);
}

function isSinglePostQuery(query, postId) {
  return (
    query.queryKey[0] === "single_post" &&
    (!postId || String(query.queryKey[1]) === String(postId))
  );
}

export function prependPostToFeeds(queryClient, post) {
  if (!post) return;
  queryClient.setQueriesData({ predicate: isPostListQuery }, (old) => {
    if (!Array.isArray(old)) return old;
    return [post, ...old];
  });
}

export function replacePostEverywhere(queryClient, postId, updatedPost) {
  if (!updatedPost) return;

  queryClient.setQueriesData({ predicate: isPostListQuery }, (old) => {
    if (!Array.isArray(old)) return old;
    return old.map((item) => {
      // bookmark entries can wrap the post as { post: {...} }
      if (item?.post) {
        return getId(item.post) === postId ? { ...item, post: updatedPost } : item;
      }
      return getId(item) === postId ? updatedPost : item;
    });
  });

  queryClient.setQueriesData(
    { predicate: (query) => isSinglePostQuery(query, postId) },
    (old) => (old ? { ...old, post: updatedPost } : old)
  );
}

// Merge-only patch (unlike replacePostEverywhere) - safe to use when the
// mutation response only returns partial fields (e.g. just an updated
// likesCount/isLiked), so it never wipes out the rest of the cached post.
export function patchPostEverywhere(queryClient, postId, patcher) {
  queryClient.setQueriesData({ predicate: isPostListQuery }, (old) => {
    if (!Array.isArray(old)) return old;
    return old.map((item) => {
      if (item?.post) {
        return getId(item.post) === postId ? { ...item, post: { ...item.post, ...patcher(item.post) } } : item;
      }
      return getId(item) === postId ? { ...item, ...patcher(item) } : item;
    });
  });

  queryClient.setQueriesData(
    { predicate: (query) => isSinglePostQuery(query, postId) },
    (old) => (old?.post ? { ...old, post: { ...old.post, ...patcher(old.post) } } : old)
  );
}

export function removePostEverywhere(queryClient, postId) {
  queryClient.setQueriesData({ predicate: isPostListQuery }, (old) => {
    if (!Array.isArray(old)) return old;
    return old.filter((item) => {
      const id = item?.post ? getId(item.post) : getId(item);
      return id !== postId;
    });
  });

  queryClient.removeQueries({ predicate: (query) => isSinglePostQuery(query, postId) });
}
