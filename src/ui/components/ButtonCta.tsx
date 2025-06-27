"use client";
/*
 * Documentation:
 * Button CTA — https://app.subframe.com/bbaea32c4115/library?component=Button+CTA_ac0d17b4-1c99-416a-9e3b-c9689dff9ee9
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { FeatherTag } from "@subframe/core";

interface ButtonCtaRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "variation";
  variant2?: "default" | "variation";
  className?: string;
}

const ButtonCtaRoot = React.forwardRef<HTMLElement, ButtonCtaRootProps>(
  function ButtonCtaRoot(
    {
      variant = "default",
      variant2 = "default",
      className,
      ...otherProps
    }: ButtonCtaRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/ac0d17b4 flex cursor-pointer flex-col items-start gap-2 hover:bg-transparent",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <div className="flex flex-col items-start gap-2 group-hover/ac0d17b4:bg-transparent">
          <div
            className={SubframeUtils.twClassNames(
              "flex items-center gap-2 rounded-lg bg-consort-red px-4 py-1 group-hover/ac0d17b4:bg-red-400",
              {
                "bg-neutral-100 group-hover/ac0d17b4:bg-brand-100":
                  variant2 === "variation",
                "bg-consort-blue group-hover/ac0d17b4:bg-brand-400":
                  variant === "variation",
              }
            )}
          >
            <span
              className={SubframeUtils.twClassNames(
                "text-body font-body text-white",
                { "text-consort-blue": variant2 === "variation" }
              )}
            >
              Label
            </span>
            <FeatherTag
              className={SubframeUtils.twClassNames(
                "text-body font-body text-white",
                { "text-consort-blue": variant2 === "variation" }
              )}
            />
          </div>
        </div>
      </div>
    );
  }
);

const ButtonCta = ButtonCtaRoot;
