"use client";
/*
 * Documentation:
 * Badge Consort — https://app.subframe.com/bbaea32c4115/library?component=Badge+Consort_be05d522-cf36-4e2f-bd43-475a9b7c6a4c
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface BadgeConsortRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "brand" | "neutral" | "error" | "warning" | "success" | "dark";
  icon?: React.ReactNode;
  children?: React.ReactNode;
  iconRight?: React.ReactNode;
  variant2?: "default" | "small";
  className?: string;
}

const BadgeConsortRoot = React.forwardRef<HTMLElement, BadgeConsortRootProps>(
  function BadgeConsortRoot(
    {
      variant = "brand",
      icon = null,
      children,
      iconRight = null,
      variant2 = "default",
      className,
      ...otherProps
    }: BadgeConsortRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/be05d522 flex h-full max-h-[32px] items-center gap-1 rounded-md border border-solid border-brand-100 bg-brand-100 px-2 cursor-pointer transition-all duration-200 hover:bg-brand-200",
          {
            "w-auto px-1.5 h-auto": variant2 === "small",
            "border border-solid border-success-100 bg-success-100 hover:bg-success-200":
              variant === "success",
            "border border-solid border-warning-100 bg-warning-100 hover:bg-warning-200":
              variant === "warning",
            "border border-solid border-error-100 bg-error-100 hover:bg-error-200":
              variant === "error",
            "border border-solid border-neutral-100 bg-neutral-100 hover:bg-neutral-200":
              variant === "neutral",
            "border border-solid border-neutral-700 bg-neutral-700 hover:bg-neutral-800":
              variant === "dark",
          },
          className
        )}
        ref={ref as React.RefObject<HTMLDivElement>}
        {...otherProps}
      >
        {icon ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "text-caption font-caption text-brand-700",
              {
                "text-success-800": variant === "success",
                "text-warning-800": variant === "warning",
                "text-error-700": variant === "error",
                "text-neutral-700": variant === "neutral",
                "text-white": variant === "dark",
              }
            )}
          >
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        {children ? (
          <span
            className={SubframeUtils.twClassNames(
              "whitespace-nowrap text-caption font-caption text-brand-800",
              {
                "text-sm font-medium leading-tight tracking-[-0.2px]":
                  variant2 === "small",
                "text-success-800": variant === "success",
                "text-warning-800": variant === "warning",
                "text-error-800": variant === "error",
                "text-neutral-700": variant === "neutral",
                "text-white": variant === "dark",
              }
            )}
          >
            {children}
          </span>
        ) : null}
        {iconRight ? (
          <SubframeCore.IconWrapper
            className={SubframeUtils.twClassNames(
              "text-caption font-caption text-brand-700",
              {
                "text-success-800": variant === "success",
                "text-warning-800": variant === "warning",
                "text-error-700": variant === "error",
                "text-neutral-700": variant === "neutral",
                "text-white": variant === "dark",
              }
            )}
          >
            {iconRight}
          </SubframeCore.IconWrapper>
        ) : null}
      </div>
    );
  }
);

export const BadgeConsort = BadgeConsortRoot;
