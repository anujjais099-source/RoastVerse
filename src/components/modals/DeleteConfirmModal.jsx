import { AlertTriangle } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function DeleteConfirmModal() {
  const { deleteConfirmOpen, setDeleteConfirmOpen, account, points, handleDeleteAccount } = useApp();

  if (!deleteConfirmOpen) return null;

  return (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6" onClick={() => setDeleteConfirmOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm c-bg-surface-solid rounded-3xl p-7 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="font-display font-700 text-lg c-text-text-1 mb-2">Delete your account?</h3>
            <p className="c-text-text-2 text-sm mb-6">
              This permanently deletes @{account?.username} and all {points.toLocaleString()} points. This can't be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmOpen(false)} className="flex-1 py-3 rounded-xl border c-border-border-15 text-sm font-600 c-text-text-1">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-600">
                Delete
              </button>
            </div>
          </div>
        </div>
  );
}
