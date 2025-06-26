"use client";
/*
 * Documentation:
 * Alert — https://app.subframe.com/bbaea32c4115/library?component=Alert_3a65613d-d546-467c-80f4-aaba6a7edcd5
 * Icon Button — https://app.subframe.com/bbaea32c4115/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { FeatherInfo } from "@subframe/core";

interface AlertRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: "brand" | "neutral" | "error" | "success" | "warning";
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const AlertRoot = React.forwardRef<HTMLElement, AlertRootProps>(
  function AlertRoot(
    {
      variant = "neutral",
      icon,
      title,
      description,
      actions,
      className,
      ...otherProps
    }: AlertRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/3a65613d flex w-full items-start gap-3 rounded border border-solid bg-white px-4 py-3 shadow-sm",
          {
            "border-error-200 bg-error-50": variant === "error",
            "border-success-200 bg-success-50": variant === "success",
            "border-warning-200 bg-warning-50": variant === "warning",
            "border-brand-200 bg-brand-50": variant === "brand",
          },
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        {icon ? (
          <div className="flex h-5 w-5 flex-none items-center justify-center">
            {icon}
          </div>
        ) : null}
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
          {title ? (
            <span className="text-body-bold font-body-bold text-default-font">
              {title}
            </span>
          ) : null}
          {description ? (
            <span className="text-body font-body text-subtext-color">
              {description}
            </span>
          ) : null}
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    );
  }
);

export const Alert = AlertRoot;
