import SuggestedUsers from "../../pages/profile/SuggestedUsers";

export default function RightSidebar() {
  return (
    <aside className="no-scrollbar hidden xl:block w-[310px] flex-shrink-0 sticky top-[64px] self-start max-h-[calc(100vh-64px)] overflow-y-auto py-4 pl-2 pr-3">
      <SuggestedUsers title="People You May Know" />
    </aside>
  );
}
