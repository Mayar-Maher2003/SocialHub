import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

export default function Notfound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="bg-page min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-surface border border-subtle rounded-2xl p-8 flex flex-col items-center text-center gap-4">
        <p className="text-6xl sm:text-7xl font-bold text-cyan-400 leading-none">
          404
        </p>

        <h1 className="text-xl sm:text-2xl font-semibold text-ink">
          Page not found
        </h1>

        <p className="text-sm text-muted">
          We couldn&apos;t find anything at{" "}
          <span className="text-ink break-all">{pathname}</span>. The link may
          be broken, or the page may have been moved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 h-10 px-4 rounded-xl border border-subtle text-ink hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <IoIosArrowBack className="text-lg" />
            Go back
          </button>

          <Link
            to="/"
            className="h-10 px-5 flex items-center rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition duration-300"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
