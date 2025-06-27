"use client";
/*
 * Documentation:
 * Link Button Consort — https://app.subframe.com/bbaea32c4115/library?component=Link+Button+Consort_3b6cb7f2-9a1e-4694-b17b-b800d6006434
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface LinkButtonConsortRootProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brand" | "neutral" | "inverse";
  size?: "large" | "medium" | "small";
  icon?: React.ReactNode;
  children?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const LinkButtonConsortRoot = React.forwardRef<
  HTMLElement,
  LinkButtonConsortRootProps
>(function LinkButtonConsortRoot(
  {
    variant = "neutral",
    size = "medium",
    icon = null,
    children,
    iconRight = null,
    className,
    type = "button",
    ...otherProps
  }: LinkButtonConsortRootProps,
  ref
) {
  return (
    <button
      className={SubframeUtils.twClassNames(
        "group/3b6cb7f2 flex cursor-pointer items-center gap-1 border-none bg-transparent",
        { "flex-row flex-nowrap gap-1": size === "large" },
        className
      )}
      ref={ref as any}
      type={type}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-body font-body text-neutral-700 group-hover/3b6cb7f2:text-brand-700 group-disabled/3b6cb7f2:text-neutral-400 group-hover/3b6cb7f2:group-disabled/3b6cb7f2:text-neutral-400",
            {
              "text-caption font-caption": size === "small",
              "text-heading-3 font-heading-3": size === "large",
              "text-white group-hover/3b6cb7f2:text-white":
                variant === "inverse",
              "text-brand-700 group-hover/3b6cb7f2:text-brand-700":
                variant === "brand",
            }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      <span
        className={SubframeUtils.twClassNames(
          "text-body font-body text-neutral-700 group-hover/3b6cb7f2:text-brand-700 group-hover/3b6cb7f2:underline group-disabled/3b6cb7f2:text-neutral-400 group-hover/3b6cb7f2:group-disabled/3b6cb7f2:text-neutral-400 group-hover/3b6cb7f2:group-disabled/3b6cb7f2:no-underline",
          {
            "text-caption font-caption": size === "small",
            "text-heading-3 font-heading-3": size === "large",
            "text-white group-hover/3b6cb7f2:text-warning-400":
              variant === "inverse",
            "text-brand-700 group-hover/3b6cb7f2:text-brand-700":
              variant === "brand",
          }
        )}
      >
        Label
      </span>
      {iconRight ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-body font-body text-neutral-700 group-hover/3b6cb7f2:text-brand-700 group-disabled/3b6cb7f2:text-neutral-400 group-hover/3b6cb7f2:group-disabled/3b6cb7f2:text-neutral-400",
            {
              "text-caption font-caption": size === "small",
              "text-heading-3 font-heading-3": size === "large",
              "text-white group-hover/3b6cb7f2:text-white":
                variant === "inverse",
              "text-brand-700 group-hover/3b6cb7f2:text-brand-700":
                variant === "brand",
            }
          )}
        >
          {iconRight}
        </SubframeCore.IconWrapper>
      ) : null}
    </button>
  );
});

const LinkButtonConsort = LinkButtonConsortRoot;
