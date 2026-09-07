// Helpers for reading/patching a useInfiniteQuery cache of paginated
// notifications, without assuming an exact backend response shape.

function getId(item) {
  return item?._id || item?.id;
}

function getItems(page) {
  return (
    page?.data?.notifications ||
    (Array.isArray(page?.data) ? page.data : null) ||
    page?.notifications ||
    (Array.isArray(page) ? page : []) ||
    []
  );
}

function setItems(page, items) {
  if (page?.data?.notifications) return { ...page, data: { ...page.data, notifications: items } };
  if (Array.isArray(page?.data)) return { ...page, data: items };
  if (page?.notifications) return { ...page, notifications: items };
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

export function markItemRead(queryClient, queryKey, notificationId) {
  queryClient.setQueryData(queryKey, (old) => {
    if (!old?.pages?.length) return old;
    return {
      ...old,
      pages: old.pages.map((page) => {
        const items = getItems(page).map((n) =>
          getId(n) === notificationId ? { ...n, isRead: true, read: true } : n
        );
        return setItems(page, items);
      }),
    };
  });
}

export function markAllRead(queryClient, queryKey) {
  queryClient.setQueryData(queryKey, (old) => {
    if (!old?.pages?.length) return old;
    return {
      ...old,
      pages: old.pages.map((page) => setItems(page, getItems(page).map((n) => ({ ...n, isRead: true, read: true })))),
    };
  });
}
