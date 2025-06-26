"use client";
/*
 * Documentation:
 * Home List Item — https://app.subframe.com/bbaea32c4115/library?component=Home+List+Item_ebb36ea3-fbec-433a-9b2b-1ba94ab49667
 * Dropdown Menu — https://app.subframe.com/bbaea32c4115/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Icon Button — https://app.subframe.com/bbaea32c4115/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherBarChart3 } from "@subframe/core";
import { DropdownMenu } from "./DropdownMenu";
import { FeatherStar } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";

interface HomeListItemRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  metadata?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const HomeListItemRoot = React.forwardRef<HTMLElement, HomeListItemRootProps>(
  function HomeListItemRoot(
    {
      icon = <FeatherBarChart3 />,
      title,
      subtitle,
      metadata,
      children,
      className,
      ...otherProps
    }: HomeListItemRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/ebb36ea3 flex w-full cursor-pointer items-center gap-4 rounded-md px-2 py-2 hover:bg-neutral-50",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <div className="flex items-center gap-2 px-1 py-1">
          {icon ? (
            <SubframeCore.IconWrapper className="font-['Inter'] text-[24px] font-[500] leading-[24px] text-brand-700">
              {icon}
            </SubframeCore.IconWrapper>
          ) : null}
        </div>
        <div className="flex grow shrink-0 basis-0 flex-col items-start">
          {title ? (
            <span className="line-clamp-1 w-full text-body font-body text-default-font">
              {title}
            </span>
          ) : null}
          {subtitle ? (
            <span className="w-full text-caption font-caption text-subtext-color">
              {subtitle}
            </span>
          ) : null}
        </div>
        {metadata ? (
          <span className="grow shrink-0 basis-0 text-body font-body text-subtext-color">
            {metadata}
          </span>
        ) : null}
        {children ? (
          <div className="flex items-center justify-end gap-2">{children}</div>
        ) : null}
      </div>
    );
  }
);

const HomeListItem = HomeListItemRoot;
