"use client";
/*
 * Documentation:
 * Button3 — https://app.subframe.com/bbaea32c4115/library?component=Button3_41944147-8f2e-45ff-a495-d4875411f68d
 */

import React from "react";
import * as SubframeUtils from "../utils";
// ✅ OPTIMIZED: Import only what we need instead of entire @subframe/core library
import { IconWrapper, Loader } from "@subframe/core";

interface Button3RootProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "brand-primary"
    | "brand-secondary"
    | "brand-tertiary"
    | "neutral-primary"
    | "neutral-secondary"
    | "neutral-tertiary"
    | "destructive-primary"
    | "destructive-secondary"
    | "destructive-tertiary"
    | "success-primary"
    | "success-secondary"
    | "success-tertiary"
    | "warning-primary"
    | "warning-secondary"
    | "warning-tertiary"
    | "inverse"
    | "link"
    | "black"
    | "link-white";
  size?: "large" | "medium" | "small";
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const Button3Root = React.forwardRef<HTMLElement, Button3RootProps>(
  function Button3Root(
    {
      variant = "brand-primary",
      size = "medium",
      children,
      icon = null,
      iconRight = null,
      loading = false,
      className,
      type = "button",
      ...otherProps
    }: Button3RootProps,
    ref
  ) {
    return (
      <button
        className={SubframeUtils.twClassNames(
          "group/41944147 flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-sm border-none bg-brand-primary px-4 hover:bg-brand-700 active:bg-brand-600 disabled:cursor-default disabled:bg-neutral-200 hover:disabled:cursor-default hover:disabled:bg-neutral-200 active:disabled:cursor-default active:disabled:bg-neutral-200",
          {
            "h-6 w-auto flex-row flex-nowrap gap-1.5 px-2.5 py-0":
              size === "small",
            "h-10 w-auto flex-row flex-nowrap gap-2.5 px-4 py-0":
              size === "large",
            "h-full w-auto rounded-none bg-transparent px-0.5 py-0 hover:bg-transparent active:bg-transparent":
              variant === "link-white",
            "bg-neutral-800 hover:bg-error-600 active:bg-warning-600":
              variant === "black",
            "rounded-sm bg-transparent pl-0.5 pr-1 py-0 hover:bg-transparent active:bg-transparent":
              variant === "link",
            "bg-transparent hover:bg-[#ffffff29] active:bg-[#ffffff3d]":
              variant === "inverse",
            "bg-transparent hover:bg-error-50 active:bg-error-100":
              variant === "destructive-tertiary",
            "bg-error-50 hover:bg-error-100 active:bg-error-50":
              variant === "destructive-secondary",
            "bg-consort-red hover:bg-red-700 active:bg-error-600":
              variant === "destructive-primary",
            "bg-lime-500 hover:bg-lime-600 active:bg-lime-700":
              variant === "success-primary",
            "bg-lime-100 hover:bg-lime-200 active:bg-lime-100":
              variant === "success-secondary",
            "bg-transparent hover:bg-lime-100 active:bg-lime-100":
              variant === "success-tertiary",
            "bg-amber-400 hover:bg-amber-500 active:bg-amber-700":
              variant === "warning-primary",
            "bg-amber-100 hover:bg-amber-200 active:bg-amber-100":
              variant === "warning-secondary",
            "bg-transparent hover:bg-amber-100 active:bg-amber-100":
              variant === "warning-tertiary",
            "bg-transparent hover:bg-neutral-200 active:bg-neutral-200":
              variant === "neutral-tertiary",
            "border border-solid border-neutral-border bg-default-background hover:bg-neutral-50 active:bg-default-background":
              variant === "neutral-secondary",
            "bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-100":
              variant === "neutral-primary",
            "bg-transparent hover:bg-brand-50 active:bg-brand-100":
              variant === "brand-tertiary",
            "bg-brand-50 hover:bg-brand-100 active:bg-brand-50":
              variant === "brand-secondary",
          },
          className
        )}
        ref={ref as any}
        type={type}
        {...otherProps}
      >
        {icon ? (
          <IconWrapper
            className={SubframeUtils.twClassNames(
              "text-body font-body text-white group-disabled/41944147:text-neutral-400",
              {
                hidden: loading,
                "text-caption font-caption": size === "small",
                "text-body-lg font-body": size === "large",
                "text-consort-blue group-hover/41944147:text-consort-red group-active/41944147:text-consort-red":
                  variant === "link",
                "text-white": variant === "inverse",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
                "text-lime-700":
                  variant === "success-tertiary" ||
                  variant === "success-secondary",
                "text-amber-700":
                  variant === "warning-tertiary" ||
                  variant === "warning-secondary",
                "text-neutral-700":
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700":
                  variant === "brand-tertiary" || variant === "brand-secondary",
              }
            )}
          >
            {icon}
          </IconWrapper>
        ) : null}
        <div
          className={SubframeUtils.twClassNames(
            "hidden h-4 w-4 flex-none items-center justify-center gap-2",
            { flex: loading, "h-3 w-3 flex-none": size === "small" }
          )}
        >
          <Loader
            className={SubframeUtils.twClassNames(
              "text-caption font-caption text-white group-disabled/41944147:text-neutral-400",
              {
                "inline-block font-['Inter'] text-[12px] font-[400] leading-[20px] tracking-normal":
                  loading,
                "text-caption font-caption": size === "small",
                "text-body-lg font-body": size === "large",
                "text-consort-blue group-hover/41944147:text-consort-red group-active/41944147:text-consort-red":
                  variant === "link",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
                "text-lime-700":
                  variant === "success-tertiary" ||
                  variant === "success-secondary",
                "text-amber-700":
                  variant === "warning-tertiary" ||
                  variant === "warning-secondary",
                "text-neutral-700":
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700":
                  variant === "brand-tertiary" || variant === "brand-secondary",
              }
            )}
          />
        </div>
        {children ? (
          <span
            className={SubframeUtils.twClassNames(
              "whitespace-nowrap text-body font-body text-white group-disabled/41944147:text-neutral-400",
              {
                hidden: loading,
                "text-caption font-caption": size === "small",
                "text-body font-body": size === "large",
                "group-hover/41944147:text-warning-400 group-active/41944147:text-warning-500":
                  variant === "link-white",
                "text-consort-blue group-hover/41944147:text-consort-red group-active/41944147:text-consort-red":
                  variant === "link",
                "text-white": variant === "inverse",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
                "text-lime-700":
                  variant === "success-tertiary" ||
                  variant === "success-secondary",
                "text-amber-700":
                  variant === "warning-tertiary" ||
                  variant === "warning-secondary",
                "text-neutral-700":
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700":
                  variant === "brand-tertiary" || variant === "brand-secondary",
              }
            )}
          >
            {children}
          </span>
        ) : null}
        {iconRight ? (
          <IconWrapper
            className={SubframeUtils.twClassNames(
              "text-body font-body text-white group-disabled/41944147:text-neutral-400",
              {
                "text-caption font-caption": size === "small",
                "text-body-lg font-body": size === "large",
                "text-consort-blue group-hover/41944147:text-consort-red group-active/41944147:text-consort-red":
                  variant === "link",
                "text-white": variant === "inverse",
                "text-error-700":
                  variant === "destructive-tertiary" ||
                  variant === "destructive-secondary",
                "text-lime-700":
                  variant === "success-tertiary" ||
                  variant === "success-secondary",
                "text-amber-700":
                  variant === "warning-tertiary" ||
                  variant === "warning-secondary",
                "text-neutral-700":
                  variant === "neutral-tertiary" ||
                  variant === "neutral-secondary" ||
                  variant === "neutral-primary",
                "text-brand-700":
                  variant === "brand-tertiary" || variant === "brand-secondary",
              }
            )}
          >
            {iconRight}
          </IconWrapper>
        ) : null}
      </button>
    );
  }
);

export const Button3 = Button3Root;
