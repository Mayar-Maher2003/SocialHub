// Helpers for reading/patching a useInfiniteQuery cache of paginated
// comments/replies, without assuming an exact backend response shape and
// without forcing a full refetch after create/edit/delete/like.

function getId(item) {
  return item?._id || item?.id;
}

function getItems(page) {
  return (
    page?.data?.comments ||
    page?.data?.replies ||
    (Array.isArray(page?.data) ? page.data : null) ||
    page?.comments ||
    page?.replies ||
    (Array.isArray(page) ? page : []) ||
    []
  );
}

function setItems(page, items) {
  if (page?.data?.comments) return { ...page, data: { ...page.data, comments: items } };
  if (page?.data?.replies) return { ...page, data: { ...page.data, replies: items } };
  if (Array.isArray(page?.data)) return { ...page, data: items };
  if (page?.comments) return { ...page, comments: items };
  if (page?.replies) return { ...page, replies: items };
  if (Array.isArray(page)) return items;
  return page;
}

// Extract the items array and whatever pagination metadata is present, under
// whichever field name the backend actually used, without assuming one.
export function normalizePage(page) {
  const items = getItems(page);
  const meta =
    page?.metadata ||
    page?.paginationInfo ||
    page?.pagination ||
    page?.data?.metadata ||
    page?.data?.paginationInfo ||
    page?.data?.pagination ||
    null;
  return { items, meta };
}

export function prependItem(queryClient, queryKey, item) {
  if (!item) return;
  const itemId = getId(item);
  queryClient.setQueryData(queryKey, (old) => {
    if (!old?.pages?.length) return old;
    const [firstPage, ...rest] = old.pages;
    const items = getItems(firstPage);
    if (itemId && items.some((i) => getId(i) === itemId)) return old;
    return { ...old, pages: [setItems(firstPage, [item, ...items]), ...rest] };
  });
}

export function updateItem(queryClient, queryKey, itemId, updater) {
  queryClient.setQueryData(queryKey, (old) => {
    if (!old?.pages?.length) return old;
    return {
      ...old,
      pages: old.pages.map((page) => {
        const items = getItems(page);
        const nextItems = items.map((i) => (getId(i) === itemId ? updater(i) : i));
        return setItems(page, nextItems);
      }),
    };
  });
}

export function removeItem(queryClient, queryKey, itemId) {
  queryClient.setQueryData(queryKey, (old) => {
    if (!old?.pages?.length) return old;
    return {
      ...old,
      pages: old.pages.map((page) => setItems(page, getItems(page).filter((i) => getId(i) !== itemId))),
    };
  });
}

// Shared getNextPageParam for both comments and replies: prefer explicit
// backend pagination metadata under any of its common field names, and fall
// back to a "was this page full?" heuristic when none is present.
export function getNextPageParam(limit) {
  return (lastPage, allPages) => {
    const { items, meta } = normalizePage(lastPage);
    if (meta?.nextPage != null) return meta.nextPage || undefined;
    if (meta?.currentPage != null && meta?.numberOfPages != null) {
      return meta.currentPage < meta.numberOfPages ? meta.currentPage + 1 : undefined;
    }
    if (meta?.hasNext != null) return meta.hasNext ? allPages.length + 1 : undefined;
    return items.length === limit ? allPages.length + 1 : undefined;
  };
}
