import { ArrowRight, Check, Sparkles } from "lucide-react";
import React from "react";
export default function PlanCard({
  title,
  perks = [],
  price = null,
  badge = null,
  highlight = false,
  onAction = () => {},
  gradient,
  icon: Icon,
  disabled = false,
  isOwned = false,
}) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-3xl transition-all duration-300",
        highlight
          ? "scale-105 xl:scale-110 shadow-2xl shadow-blue-500/20 z-10"
          : "shadow-lg hover:shadow-xl",
      ].join(" ")}
    >
      {/* Gradient Border Effect */}
      <div
        className={[
          "absolute inset-0 rounded-3xl p-[2px]",
          highlight
            ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
            : "bg-gradient-to-br from-gray-200 to-gray-100",
        ].join(" ")}
      >
        <div className="h-full w-full rounded-3xl bg-white"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Badge - Popular */}
        {badge && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                {badge}
              </span>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div
          className={[
            "relative px-8 pt-10 pb-6",
            highlight
              ? "bg-gradient-to-br from-blue-50 to-indigo-50"
              : "bg-gradient-to-br from-gray-50 to-gray-100/50",
          ].join(" ")}
        >
          {/* Icon */}
          <div
            className={[
              "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4",
              `bg-gradient-to-br ${gradient} shadow-lg`,
            ].join(" ")}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>

          {/* Plan Name */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>

          {/* Price */}
          {price && (
            <div className="flex items-baseline gap-2">
              <span
                className={[
                  "text-4xl font-extrabold tracking-tight",
                  highlight
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                    : "text-gray-900",
                ].join(" ")}
              >
                {price}
              </span>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="flex-1 px-8 py-6">
          <ul className="space-y-4">
            {perks.map((perk, i) => (
              <li key={i} className="flex items-start gap-3 group/item">
                <div
                  className={[
                    "flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center",
                    highlight
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                      : "bg-gray-300",
                  ].join(" ")}
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700 leading-relaxed group-hover/item:text-gray-900 transition-colors">
                  {perk.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <div className="px-8 pb-8">
          {isOwned ? (
            <div className="w-full rounded-xl px-6 py-4 font-bold text-base bg-green-100 text-green-700 text-center">
              <span>✓ Đang sử dụng</span>
            </div>
          ) : (
            <button
              onClick={onAction}
              disabled={disabled}
              className={[
                "w-full rounded-xl px-6 py-4 font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 group/btn",
                disabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : highlight
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105"
                  : "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 shadow-md",
              ].join(" ")}
            >
              <span>Chọn gói này</span>
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
