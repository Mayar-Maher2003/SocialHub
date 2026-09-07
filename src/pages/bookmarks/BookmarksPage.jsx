import Bookmarks from "../profile/Bookmarks";

export default function BookmarksPage() {
  return (
    <div className="bg-page min-h-screen p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-ink">Bookmarks</h1>
        <Bookmarks />
      </div>
    </div>
  );
}
