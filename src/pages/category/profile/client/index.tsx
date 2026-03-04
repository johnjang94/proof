import LogoutButton from "@/components/logout-button";

export default function ClientProfile() {
  return (
    <div className="max-w-3xl mx-auto py-20 px-6 space-y-10">
      <h1 className="text-2xl font-semibold">Client Profile</h1>

      <p className="text-slate-600">
        This is where the clients could check their profile information.
      </p>

      <LogoutButton className="bg-black text-white px-4 py-2 rounded-md hover:cursor-pointer" />
    </div>
  );
}
