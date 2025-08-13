import React, { useState, useEffect, useMemo } from "react";
import { StarRating } from "./StarRating";
import { Truck, Shield, Leaf, Award, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProductInfo = ({ product }) => {
  const hasMatrix =
    !!product?.variantMatrix && Object.keys(product.variantMatrix).length > 0;

  // ---- Colors -------------------------------------------------------------
  const colorList = useMemo(() => {
    if (!hasMatrix) return product.colors || [];
    return Object.entries(product.variantMatrix)
      .filter(([, data]) => data?.size && Object.keys(data.size).length > 0)
      .map(([name]) => name);
  }, [hasMatrix, product.variantMatrix, product.colors]);

  const [selectedColor, setSelectedColor] = useState("");
  useEffect(() => {
    if (!selectedColor && colorList.length) setSelectedColor(colorList[0]);
  }, [colorList, selectedColor]);

  // ---- Sizes --------------------------------------------------------------
  const sizeOptions = useMemo(() => {
    if (!hasMatrix) return product.sizes || [];
    const sizesObj = product.variantMatrix?.[selectedColor]?.size || {};
    return Object.keys(sizesObj);
  }, [hasMatrix, product, selectedColor]);

  const [selectedSize, setSelectedSize] = useState("");
  useEffect(() => {
    if ((!selectedSize || !sizeOptions.includes(selectedSize)) && sizeOptions.length) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions, selectedSize]);

  // ---- Variant ID ---------------------------------------------------------
  const variantId = useMemo(() => {
    if (!hasMatrix) return null;
    return product.variantMatrix?.[selectedColor]?.size?.[selectedSize] ?? null;
  }, [hasMatrix, product, selectedColor, selectedSize]);

  // ---- Helpers ------------------------------------------------------------
  const getFeatureIcon = (feature) => {
    switch ((feature || "").toLowerCase()) {
      case "eco-friendly":
        return <Leaf className="w-4 h-4" />;
      case "premium quality":
        return <Shield className="w-4 h-4" />;
      case "bestseller":
        return <Award className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  // Basic review math, tolerant of different product shapes
  const { avgRating, reviewCount } = useMemo(() => {
    const reviews = Array.isArray(product?.tabs?.reviews)
      ? product.tabs.reviews.filter(Boolean)
      : Array.isArray(product?.reviews)
      ? product.reviews.filter(Boolean)
      : [];
    const count = reviews.length;
    const sum = reviews.reduce(
      (acc, r) => acc + (typeof r?.rating === "number" ? r.rating : Number(r?.rating) || 0),
      0
    );
    return { avgRating: count ? sum / count : 0, reviewCount: count };
  }, [product]);

  const navigate = useNavigate();
  const buildRedirect = () => {
    navigate("/build", {
      state: {
        itemId: product.id,
        size: selectedSize,
        color: selectedColor,
        variantId,
      },
    });
  };

  // defaults
  const features = Array.isArray(product?.features) ? product.features : [];
  const tags = Array.isArray(product?.tags) ? product.tags : [];

  const canCustomize =
    !hasMatrix || (!!selectedColor && !!selectedSize && (variantId || variantId === 0));

  return (
    <div className="space-y-6">
      {/* Title + Rating */}
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
          {product.name}
        </h1>
        <div className="flex items-center gap-2">
          {typeof StarRating !== "undefined" ? (
            <StarRating rating={avgRating} showNumber />
          ) : (
            <span className="text-sm" aria-label={`Rating ${Math.round(avgRating)} out of 5`}>
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </span>
          )}
          <span className="text-sm text-gray-500">
            ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>
      </header>

      {/* CTA */}
      <button
        onClick={buildRedirect}
        disabled={!canCustomize}
        className={[
          "w-full rounded-xl py-3 px-6 font-semibold text-white transition-all",
          "bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400",
          "shadow hover:shadow-lg active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-pink-300",
          !canCustomize ? "opacity-60 cursor-not-allowed" : ""
        ].join(" ")}
      >
        Start Customizing
      </button>

      {/* Technique */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Technique</h3>
        <span className="inline-block rounded-full border border-white/60 bg-white/70 backdrop-blur px-3 py-1 text-sm text-gray-800 shadow-sm">
          {product.technique}
        </span>
      </section>

      {/* Colors */}
      {hasMatrix && colorList.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Color</h3>
          <div className="flex flex-wrap gap-2">
            {colorList.map((name) => {
              const hex = product.variantMatrix?.[name]?.hex || "#ffffff";
              const selected = selectedColor === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedColor(name)}
                  aria-pressed={selected}
                  title={`${name} • ${hex}`}
                  className={[
                    "relative h-9 w-9 rounded-lg border transition",
                    "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300",
                    selected
                      ? "border-pink-500 ring-2 ring-pink-300"
                      : "border-gray-300 hover:border-pink-200"
                  ].join(" ")}
                  style={{ backgroundColor: hex }}
                >
                  {selected && (
                    <Check
                      className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow"
                      strokeWidth={3}
                    />
                  )}
                  <span className="sr-only">{name}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Sizes */}
      {sizeOptions.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const selected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selected}
                  className={[
                    "py-2 px-3 rounded-lg border text-sm font-medium transition",
                    "focus:outline-none focus:ring-2 focus:ring-pink-300",
                    selected
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-200 hover:border-pink-200"
                  ].join(" ")}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Price + Delivery (soft card) */}
      <section className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {"C$ " + product.price}
          </span>
          <div className="flex items-center text-sm text-gray-600">
            <Truck className="w-4 h-4 mr-1" />
            {product.deliveryEstimate} to Canada
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="inline-flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Secure checkout with Stripe
          </div>
          <span className="opacity-60">•</span>
          <div className="inline-flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5" />
            Printed on‑demand, reduced waste
          </div>
        </div>
      </section>

      {/* Features */}
      {features.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Features</h3>
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-medium"
              >
                {getFeatureIcon(feature)}
                <span>{feature}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <section>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-200 bg-white text-gray-700 px-2.5 py-1 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
