"use client";
/*
 * Documentation:
 * Home Card — https://app.subframe.com/bbaea32c4115/library?component=Home+Card_318fa7af-69f9-4374-8e26-8ec8007254b5
 * Icon with background — https://app.subframe.com/bbaea32c4115/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherAppWindow } from "@subframe/core";
import { IconWithBackground } from "./IconWithBackground";

interface HomeCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const HomeCardRoot = React.forwardRef<HTMLElement, HomeCardRootProps>(
  function HomeCardRoot(
    {
      title,
      subtitle,
      icon = <FeatherAppWindow />,
      className,
      ...otherProps
    }: HomeCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/318fa7af flex h-full w-full cursor-pointer flex-col rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm min-w-[384px] flex-nowrap items-start justify-start gap-6 hover:bg-neutral-50",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <IconWithBackground size="medium" icon={icon} />
        <div className="flex w-full flex-col gap-1 items-start justify-start">
          {title ? (
            <span className="line-clamp-1 w-full text-default-font text-heading-4 font-heading-4 text-left">
              {title}
            </span>
          ) : null}
          {subtitle ? (
            <span className="w-full text-caption font-caption text-subtext-color text-left">
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

const HomeCard = HomeCardRoot;
