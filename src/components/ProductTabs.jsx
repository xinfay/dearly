import React, { useMemo, useRef, useState, useEffect } from "react";
import { StarRating } from "./StarRating";
import PrintfulLogo from "../components/maps/PrintfulLogo.png";
import { Heart } from "lucide-react";

/* ---------- Utils ---------- */
function humanize(key) {
  if (!key) return "";
  return key.toString().replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

/* ---------- Sections ---------- */
function ReviewSection({ value }) {
  const reviews = Array.isArray(value) ? value : [value].filter(Boolean);
  const count = reviews.length;
  const avg = count
    ? reviews.reduce((sum, r) => sum + (typeof r?.rating === "number" ? r.rating : 0), 0) / count
    : 0;

  const hasStarRating = typeof StarRating !== "undefined";
  const FallbackStars = ({ rating }) => {
    const r = Math.max(0, Math.min(5, Math.round(rating || 0)));
    return (
      <span aria-label={`Rating ${r} out of 5`} className="text-sm">
        {"★".repeat(r)}
        {"☆".repeat(5 - r)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-gray-900">{avg.toFixed(1)}</div>
            {hasStarRating ? <StarRating rating={avg} size="sm" /> : <FallbackStars rating={avg} />}
            <div className="text-sm text-gray-500 mt-1">
              {count} {count === 1 ? "review" : "reviews"}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Overall</span>
              <div className="flex items-center gap-2 text-gray-700">
                {hasStarRating ? (
                  <StarRating rating={avg} size="sm" showNumber />
                ) : (
                  <>
                    <FallbackStars rating={avg} />
                    <span>{avg.toFixed(1)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map((review, idx) => (
          <div
            key={review?.id ?? idx}
            className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {review?.author || "Anonymous"}
                  </span>
                  {review?.verified ? (
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full border border-emerald-100">
                      Verified
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {hasStarRating ? (
                    <StarRating rating={review?.rating || 0} size="sm" />
                  ) : (
                    <FallbackStars rating={review?.rating || 0} />
                  )}
                  {review?.date ? (
                    <span className="text-sm text-gray-500">
                      {typeof review.date === "string" || review.date instanceof Date
                        ? new Date(review.date).toLocaleDateString()
                        : String(review.date)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            {review?.title ? (
              <h4 className="font-medium text-gray-900 mb-1.5">{review.title}</h4>
            ) : null}
            {review?.body ? (
              <p className="text-gray-700 text-sm leading-relaxed">{review.body}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function DisclaimerSection({ value }) {
  const items = Array.isArray(value) ? value : [value].filter(Boolean);
  return (
    <div className="space-y-3">
      {items.map((line, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
          <p className="text-gray-700 text-sm leading-relaxed">{String(line)}</p>
        </div>
      ))}
    </div>
  );
}

function SourceSection({ value }) {
  if (!value) return null;
  const countries = Array.isArray(value.country) ? value.country : [value.country].filter(Boolean);
  const description =
    value.description ||
    "The product blanks are made in collaboration with our trusted partners and customized in our facilities.";

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Product sourced from</h3>
      <ul className="list-disc pl-6 text-gray-700 text-sm">
        {countries.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>

      <div className="flex items-center gap-6">
        <img src={PrintfulLogo} alt="Printful" className="h-20 object-contain" />
        <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function DefaultSection({ value }) {
  if (typeof value === "string" || typeof value === "number") {
    return <p className="text-gray-700 leading-relaxed">{String(value)}</p>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-6 space-y-1 text-gray-700">
        {value.map((v, i) => (
          <li key={i}>{String(v)}</li>
        ))}
      </ul>
    );
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    return (
      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md shadow-sm">
        <table className="w-full text-sm">
          <tbody>
            {entries.map(([k, v], i) => (
              <tr key={i} className={i % 2 ? "bg-white/60" : "bg-white/90"}>
                <th className="w-44 text-left px-4 py-2 font-medium text-gray-600 align-top">
                  {humanize(k)}
                </th>
                <td className="px-4 py-2 text-gray-800">{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <pre className="text-xs text-gray-700 bg-white/70 backdrop-blur-md p-3 rounded-xl border border-white/40 overflow-auto shadow-sm">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function SectionByKey({ k, value }) {
  switch (k.toLowerCase()) {
    case "reviews":
      return <ReviewSection value={value} />;
    case "disclaimer":
      return <DisclaimerSection value={value} />;
    case "source":
      return <SourceSection value={value} />;
    default:
      return <DefaultSection value={value} />;
  }
}

/* ---------- Main ---------- */
export const ProductTabs = ({ product }) => {
  const tabsObject = product?.tabs || {};
  const keys = useMemo(() => {
    const given = Object.keys(tabsObject);
    const order = Array.isArray(product?.tabsOrder) ? product.tabsOrder : given;
    const inOrder = order.filter((k) => given.includes(k));
    const missing = given.filter((k) => !inOrder.includes(k));
    return [...inOrder, ...missing];
  }, [product]);

  const [active, setActive] = useState(keys[0] || "");
  const listRef = useRef(null);

  // Roving tabindex + arrow navigation
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
    const onKey = (e) => {
      const current = tabs.findIndex((t) => t.getAttribute("data-active") === "true");
      if (current < 0) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = (current + 1) % tabs.length;
        tabs[next].focus();
        tabs[next].click();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = (current - 1 + tabs.length) % tabs.length;
        tabs[prev].focus();
        tabs[prev].click();
      }
    };
    list.addEventListener("keydown", onKey);
    return () => list.removeEventListener("keydown", onKey);
  }, [keys, active]);

  if (!keys.length) return null;

  return (
    <div className="mt-10">
      {/* Soft background belt to match brand */}
      <div className="relative">
        <div className="absolute -inset-x-8 -top-6 bottom-6 pointer-events-none -z-10">
          <div className="absolute w-[40%] h-[40%] rounded-full bg-pink-200/40 blur-3xl top-0 left-6" />
          <div className="absolute w-[28%] h-[28%] rounded-full bg-yellow-200/40 blur-3xl bottom-4 right-8" />
        </div>

        {/* Tab list */}
        <div
          ref={listRef}
          role="tablist"
          aria-label="Product Information"
          className="flex flex-wrap gap-2 rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md p-2 shadow-sm"
        >
          {keys.map((k) => {
            const selected = active === k;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={selected}
                data-active={selected}
                onClick={() => setActive(k)}
                className={[
                  "px-4 py-2 rounded-xl text-sm transition",
                  "focus:outline-none focus:ring-2 focus:ring-pink-300",
                  selected
                    ? "bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white shadow"
                    : "bg-white/80 text-gray-700 border border-white/60 hover:bg-white"
                ].join(" ")}
              >
                {humanize(k)}
              </button>
            );
          })}
        </div>

        {/* Content card */}
        <div className="mt-4 rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md p-6 shadow-sm">
          {/* Decorative divider with heart for brand consistency */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-pink-200 to-transparent" />
            <Heart className="w-4 h-4 text-rose-500" />
            <div className="h-px flex-1 bg-gradient-to-l from-pink-200 to-transparent" />
          </div>

          {keys.map((k) => (
            <div key={k} role="tabpanel" hidden={active !== k} aria-labelledby={`tab-${k}`}>
              <SectionByKey k={k} value={tabsObject[k]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
