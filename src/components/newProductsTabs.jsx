import React, { useMemo, useState } from "react";
import { StarRating } from './StarRating';
import PrintfulLogo from "../maps/PrinfulLogo.png"

// const product = {
//   id: "poster-rose",
//   name: "Rose Poster",

//   // Optional: Controls tab display order
//   tabsOrder: ["overview", "specs", "review", "disclaimer"],

//   // Required: Defines tab content
//   tabs: {
//     overview: "A stunning rose print, perfect for home décor.",

//     // Plain object → rendered as a table
//     specs: {
//       Material: "Cotton blend",
//       GSM: 180,
//       Country: "Canada"
//     },

//     // Special key: review/reviews → special review layout
//     review: [
//       {
//         author: "Ava",
//         rating: 5,
//         title: "Loved it!",
//         body: "Great quality and colors.",
//         date: "2025-07-10"
//       },
//       {
//         author: "Zed",
//         rating: 4,
//         body: "Nice print, but shipping was slow."
//       }
//     ],

//     // Special key: disclaimer/disclaimers → bullet points
//     disclaimer: [
//       "Colors may vary by screen settings.",
//       "Hand-measured; allow ±2mm variance."
//     ]
//   }
// };


function humanize(key) {
  if (!key) return "";
  return key
    .toString()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function ReviewSection({ value }) {
  const reviews = Array.isArray(value) ? value : [value].filter(Boolean);
  const count = reviews.length;
  const avg = count
    ? reviews.reduce((sum, r) => sum + (typeof r.rating === "number" ? r.rating : 0), 0) / count
    : 0;

  // Optional StarRating component integration (if present in your project)
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
      {/* Review Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{avg.toFixed(1)}</div>
            {hasStarRating ? (
              <StarRating rating={avg} size="sm" />
            ) : (
              <FallbackStars rating={avg} />
            )}
            <div className="text-sm text-gray-500 mt-1">{count} {count === 1 ? "review" : "reviews"}</div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Overall:</span>
                {hasStarRating ? (
                  <StarRating rating={avg} size="sm" showNumber />
                ) : (
                  <div className="flex items-center space-x-2">
                    <FallbackStars rating={avg} />
                    <span className="text-gray-600">{avg.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review, idx) => (
          <div key={review?.id ?? idx} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  {review?.author ? (
                    <span className="font-medium text-gray-900">{review.author}</span>
                  ) : (
                    <span className="font-medium text-gray-900">Anonymous</span>
                  )}
                  {review?.verified ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>
                  ) : null}
                </div>
                <div className="flex items-center space-x-2 mt-1">
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
              <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
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
  const items = Array.isArray(value) ? value : [value];
  return (
    <div className="space-y-3">
      {items.map((line, index) => (
        <div key={index} className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
          <p className="text-gray-700 text-sm">{String(line)}</p>
        </div>
      ))}
    </div>
  );
}

function SourceSection({ value }) {
  if (!value) return null;

  return (
    <div className="space-y-4">
      <ul className="list-disc pl-6 text-gray-700 text-sm">
        <li>{value.country}</li>
      </ul>

      {/* Printful logo and text */}
      <div className="flex items-center space-x-3">
        <img
          src={PrintfulLogo} // import PrintfulLogo from '../assets/maps/PrintfulLogo.png';
          alt="Printful"
          className="h-8 object-contain"
        />
        <p className="text-gray-700 text-sm leading-relaxed">
          The product blanks are made in collaboration with our trusted partners and
          customized in our facilities.
        </p>
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
      <div className="overflow-hidden rounded-2xl border border-gray-200">
        <table className="w-full text-sm">
          <tbody>
            {entries.map(([k, v], i) => (
              <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}> 
                <th className="w-40 text-left px-4 py-2 font-medium text-gray-600 align-top">{humanize(k)}</th>
                <td className="px-4 py-2 text-gray-800">{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl overflow-auto">{JSON.stringify(value, null, 2)}</pre>;
}

function SectionByKey({ k, value }) {
  switch (k.toLowerCase()) {
    case "review":
    case "reviews":
      return <ReviewSection value={value} />;
    case "disclaimer":
    case "disclaimers":
      return <DisclaimerSection value={value} />;
    case "source":
      return <SourceSection value={value} />;
    default:
      return <DefaultSection value={value} />;
  }
}

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

  if (!keys.length) return null;

  return (
    <div className="mt-10">
      <div className="w-full">
        <div className="flex flex-wrap gap-2 rounded-2xl bg-gray-100 p-2">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => setActive(k)}
              className={
                "px-4 py-2 rounded-xl text-sm transition " +
                (active === k
                  ? "bg-white shadow-sm border border-gray-200"
                  : "hover:bg-white/70 hover:shadow-sm")
              }
              aria-selected={active === k}
              role="tab"
            >
              {humanize(k)}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 p-4">
          {keys.map((k) => (
            <div
              key={k}
              role="tabpanel"
              hidden={active !== k}
              aria-labelledby={`tab-${k}`}
            >
              <SectionByKey k={k} value={tabsObject[k]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
