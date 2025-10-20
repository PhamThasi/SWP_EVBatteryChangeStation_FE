import React from "react";
export default function PlanCard({
  title,
  perks = [],
  price = null,          // ví dụ: "299K/tháng" (optional)
  badge = null,          // ví dụ: "Best Value"
  highlight = false,
  onAction = () => {},
}) {
  return (
    <div
      role="button"
      onClick={onAction}
      className={[
        "group relative overflow-hidden rounded-2xl",
        "bg-white shadow-lg ring-1 ring-slate-200",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
        highlight
          ? "p-[2px] bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400"
          : "p-[1px] bg-gradient-to-br from-slate-200 to-slate-100",
      ].join(" ")}
    >
      <div className="rounded-2xl bg-white h-full">
        {/* Badge */}
        {badge && (
          <div className="absolute left-4 top-4 z-10 rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-700">
            {badge}
          </div>
        )}

        <div className="flex h-full flex-col p-6 xl:p-7">
          {/* Header */}
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h3>

          {/* Price (optional) */}
          {price && (
            <div className="mt-1 text-lg font-semibold text-slate-700">
              {price}
            </div>
          )}

          {/* Perks */}
          <ul className="mt-5 space-y-3 text-slate-700">
            {perks.map((perk, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-300 group-hover:bg-slate-400"></span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          {/* CTA ẩn: chỉ hiện khi hover để đúng “không lộ thiên” */}
          <div className="mt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              className={[
                "pointer-events-auto w-full rounded-xl px-4 py-3 text-center font-semibold",
                "transition-all duration-300",
                "bg-slate-900 text-white",
                "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
                "focus:opacity-100 focus:translate-y-0 focus:outline-none",
              ].join(" ")}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
