"use client";
/*
 * Documentation:
 * Industry_Div — https://app.subframe.com/bbaea32c4115/library?component=Industry_Div_b9bdaa02-77ea-4cea-b433-822bcceac7c5
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface Industry_DivRootProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  text?: React.ReactNode;
  text2?: React.ReactNode;
  variant?: "default" | "variation";
  className?: string;
}

const Industry_DivRoot = React.forwardRef<HTMLElement, Industry_DivRootProps>(
  function Industry_DivRoot(
    {
      image,
      text,
      text2,
      variant = "default",
      className,
      ...otherProps
    }: Industry_DivRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/b9bdaa02 flex w-64 cursor-pointer flex-col items-start gap-1 px-2 py-2 hover:rounded-md hover:bg-neutral-50",
          { "h-auto w-full": variant === "variation" },
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <div className="flex items-start gap-4">
          {image ? (
            <img
              className="h-8 w-8 flex-none object-contain mt-2"
              src={image}
            />
          ) : null}
          <div className="flex flex-col items-start gap-1">
            {text ? (
              <span className="text-heading-4 font-heading-4 text-default-font -tracking-[0.025em]">
                {text}
              </span>
            ) : null}
            {text2 ? (
              <span className="text-body font-body text-subtext-color -tracking-[0.01em]">
                {text2}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

const Industry_Div = Industry_DivRoot;
