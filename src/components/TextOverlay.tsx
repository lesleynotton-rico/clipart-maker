// src/components/TextOverlay.tsx
import React, { useMemo } from "react";
import type { TextRect } from "../config/textPositionsByLayout";

type Props = {
  rects: TextRect[];
  tokenValues: Record<string, string | undefined>;
  fontRoles?: Partial<Record<NonNullable<TextRect["fontRole"]>, string>>;
  colorRoles?: Partial<Record<NonNullable<TextRect["colorRole"]>, string>>;
  previewWidth: number;
  previewHeight: number;
  baseSize?: number; // defaults to 2000
};

export const TextOverlay: React.FC<Props> = ({
  baseSize = 2000,
  rects,
  tokenValues,
  fontRoles,
  colorRoles,
  previewWidth,
  previewHeight,
}) => {
  const scaleX = previewWidth / baseSize;
  const scaleY = previewHeight / baseSize;

  const items = useMemo(() => {
    return rects.map((r, idx) => {
      const text = (tokenValues[r.token] ?? "").toString().trim();
      if (!text) return null;

      const left = r.x * baseSize * scaleX;
      const top = r.y * baseSize * scaleY;
      const width = r.w * baseSize * scaleX;
      const height = r.h * baseSize * scaleY;

      const fontFamily =
        r.fontRole && fontRoles?.[r.fontRole] ? fontRoles[r.fontRole] : "inherit";
      const color =
        r.colorRole && colorRoles?.[r.colorRole]
          ? colorRoles[r.colorRole]
          : "#000000"; // all text black fallback

      const approxLineHeight = (r.lineHeight ?? 90) * (previewHeight / baseSize);
      const fontSize = approxLineHeight * 0.5;
      const textAlign = r.align ?? "left";

      return (
        <div
          key={idx}
          style={{
            position: "absolute",
            left,
            top,
            width,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent:
              textAlign === "center"
                ? "center"
                : textAlign === "right"
                ? "flex-end"
                : "flex-start",
            textAlign,
            fontFamily,
            color,
            lineHeight: `${approxLineHeight}px`,
            fontSize,
            textShadow: "0 1px 2px rgba(0,0,0,0.20)",
            userSelect: "none",
            pointerEvents: "none",
            padding: "0 8px",
          }}
        >
          <span
            style={{
              width: "100%",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: r.maxLines ?? 2,
              WebkitBoxOrient: "vertical" as any,
            }}
          >
            {text}
          </span>
        </div>
      );
    });
  }, [rects, tokenValues, scaleX, scaleY, previewHeight, baseSize, fontRoles, colorRoles]);

  return <div className="absolute inset-0 pointer-events-none">{items}</div>;
};
