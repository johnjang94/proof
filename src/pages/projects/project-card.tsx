import Image from "next/image";

type ProjectStatus = "Open" | "Pending" | "Closed";

type Project = {
  id: string;
  title: string;
  typeTag: "Simulation";
  badge: "practice";
  imageSrc: string;
  lookingForLabel: string;
  lookingForValue: string;
  hostedByLabel: string;
  hostedByValue: string;
  status: ProjectStatus;
  noteLabel: string;
  noteValue: string;
};

const categories = [
  "ALL",
  "ACCOUNTING",
  "ADMINISTRATION",
  "DESIGN",
  "DEVELOPMENT",
  "MARKETING",
  "SALES",
  "TEACHING",
  "WRITING",
];

const projects: Project[] = [
  {
    id: "base-k",
    title: "Base-K",
    typeTag: "Simulation",
    badge: "practice",
    imageSrc: "/image/base-k-analysis.png",
    lookingForLabel: "Looking for",
    lookingForValue: "UX Designer",
    hostedByLabel: "Hosted by",
    hostedByValue: "Lumea Education",
    status: "Open",
    noteLabel: "Note",
    noteValue: "This is an internal project for demo",
  },
  {
    id: "node-x",
    title: "Node-X",
    typeTag: "Simulation",
    badge: "practice",
    imageSrc: "/image/team-meeting.png",
    lookingForLabel: "Looking for",
    lookingForValue: "Project Coordinator",
    hostedByLabel: "Hosted by",
    hostedByValue: "Lumea Education",
    status: "Pending",
    noteLabel: "Note",
    noteValue: "This is an internal project for demo",
  },
  {
    id: "opentab",
    title: "OpenTab",
    typeTag: "Simulation",
    badge: "practice",
    imageSrc: "/image/marketer.png",
    lookingForLabel: "Looking for",
    lookingForValue: "Digital Marketer",
    hostedByLabel: "Hosted by",
    hostedByValue: "Lumea Education",
    status: "Closed",
    noteLabel: "Note",
    noteValue: "This is an internal project for demo",
  },
  {
    id: "wayfair",
    title: "WayFair",
    typeTag: "Simulation",
    badge: "practice",
    imageSrc: "/image/designing.png",
    lookingForLabel: "Looking for",
    lookingForValue: "UI Designer",
    hostedByLabel: "Hosted by",
    hostedByValue: "Lumea Education",
    status: "Pending",
    noteLabel: "Note",
    noteValue: "This is an internal project for demo",
  },
  {
    id: "rooters",
    title: "Rooters",
    typeTag: "Simulation",
    badge: "practice",
    imageSrc: "/image/hr-rooters.png",
    lookingForLabel: "Looking for",
    lookingForValue: "HR Coordinator",
    hostedByLabel: "Hosted by",
    hostedByValue: "Lumea Education",
    status: "Open",
    noteLabel: "Note",
    noteValue: "This is an internal project for demo",
  },
  {
    id: "synclab",
    title: "SyncLab",
    typeTag: "Simulation",
    badge: "practice",
    imageSrc: "/image/party-rock.png",
    lookingForLabel: "Looking for",
    lookingForValue: "Event Executioner",
    hostedByLabel: "Hosted by",
    hostedByValue: "Lumea Education",
    status: "Open",
    noteLabel: "Note",
    noteValue: "This is an internal project for demo",
  },
];

function statusUI(status: ProjectStatus) {
  if (status === "Open") {
    return {
      statusTextClass: "text-emerald-600",
      buttonText: "Apply to Join",
      buttonClass:
        "border-emerald-400 text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-200",
    };
  }
  if (status === "Pending") {
    return {
      statusTextClass: "text-orange-500",
      buttonText: "Coming soon",
      buttonClass:
        "border-orange-300 text-orange-600 hover:bg-orange-50 focus:ring-orange-200",
    };
  }
  return {
    statusTextClass: "text-neutral-400",
    buttonText: "Under Review",
    buttonClass:
      "border-neutral-200 text-neutral-400 bg-neutral-50 cursor-not-allowed",
  };
}

export default function GuestHome() {
  return (
    <main className="mx-auto w-full px-6 pb-16">
      <section className="mb-8 text-center">
        <h1 className="md:text-3xl italic tracking-wide text-neutral-900 text-xl">
          Work on real projects. Prove your skills. Build your track record
        </h1>
      </section>

      <section className="mb-8">
        <div className="-mx-6 px-6">
          <div
            className={[
              "flex gap-3 overflow-x-auto whitespace-nowrap",
              "touch-pan-x overscroll-x-contain",
              "py-1",
              "scrollbar-none",
              "lg:flex-wrap lg:justify-center lg:overflow-visible",
            ].join(" ")}
          >
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={[
                  "shrink-0",
                  "rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2",
                  "text-xs font-medium tracking-wide text-neutral-700",
                  "hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-200",
                ].join(" ")}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const ui = statusUI(p.status);

            return (
              <article
                key={p.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="relative h-44 w-full bg-neutral-100">
                  <Image
                    src={p.imageSrc}
                    alt={`${p.title} thumbnail`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />

                  <span className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-neutral-700">
                    {p.badge}
                  </span>
                </div>

                <div className="px-4 pb-4 pt-3">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                      {p.typeTag}
                    </span>
                    <h3 className="text-base font-medium text-neutral-900">
                      {p.title}
                    </h3>
                  </div>

                  <dl className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <dt className="text-neutral-500">{p.lookingForLabel}</dt>
                      <dd className="text-right text-neutral-800">
                        {p.lookingForValue}
                      </dd>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <dt className="text-neutral-500">{p.hostedByLabel}</dt>
                      <dd className="text-right text-neutral-800">
                        {p.hostedByValue}
                      </dd>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <dt className="text-neutral-500">Status</dt>
                      <dd className={`text-right ${ui.statusTextClass}`}>
                        {p.status}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    disabled={p.status === "Closed"}
                    className={[
                      "mt-4 w-full rounded-lg border px-3 py-2 text-sm font-medium",
                      "focus:outline-none focus:ring-2",
                      ui.buttonClass,
                      p.status === "Open" ? "cursor-pointer" : "cursor-default",
                    ].join(" ")}
                  >
                    {ui.buttonText}
                  </button>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="text-neutral-500">{p.noteLabel}</div>
                    <div className="text-right text-neutral-600">
                      {p.noteValue}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
