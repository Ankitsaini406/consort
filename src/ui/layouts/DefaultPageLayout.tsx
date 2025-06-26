"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/bbaea32c4115/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Topbar with center nav — https://app.subframe.com/bbaea32c4115/library?component=Topbar+with+center+nav_2d99c811-1412-432c-b923-b290dd513802
 * Icon Button — https://app.subframe.com/bbaea32c4115/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
// Removed TopbarWithCenterNav import - component was unused and removed
import { IconButton } from "../components/IconButton";
import { FeatherBell, FeatherUser } from "@subframe/core";

interface DefaultPageLayoutRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const DefaultPageLayoutRoot = React.forwardRef<
  HTMLElement,
  DefaultPageLayoutRootProps
>(function DefaultPageLayoutRoot(
  { children, className, ...otherProps }: DefaultPageLayoutRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-screen w-full flex-col items-center bg-gradient-to-b from-blue-50 to-slate-50",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {/* Removed TopbarWithCenterNav - component was unused and removed for bundle optimization */}
      <div className="hidden">
        {/* Placeholder for future navigation if needed */}
      </div>
      {children ? (
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 overflow-y-auto bg-neutral-50">
          {children}
        </div>
      ) : null}
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;
