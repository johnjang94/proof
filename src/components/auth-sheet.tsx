export default function AuthSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60">
      {/* overlay */}
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close auth"
      />

      {/* sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Account</h2>
          <button className="border rounded px-3 py-1" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="space-y-2">
          <button className="w-full border rounded px-4 py-3">
            Continue with Google (later)
          </button>
          <button className="w-full border rounded px-4 py-3">
            Sign up with Email (optional)
          </button>
          <button className="w-full border rounded px-4 py-3">
            Log in with Email (optional)
          </button>
        </div>

        <p className="text-xs opacity-70 mt-3">
          지금은 UI만. 나중에 여기서 Google Auth 붙이면 됨.
        </p>
      </div>
    </div>
  );
}
