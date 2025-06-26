"use client";
/*
 * Documentation:
 * industry_card — https://app.subframe.com/bbaea32c4115/library?component=industry_card_4d073baf-bdc3-45f1-a664-ca0290c55adf
 * Icon Button — https://app.subframe.com/bbaea32c4115/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface Industry_CardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  text?: React.ReactNode;
  text2?: React.ReactNode;
  industryCard?: React.ReactNode;
  variant?: "default" | "variation";
  className?: string;
}

const Industry_CardRoot = React.forwardRef<HTMLElement, Industry_CardRootProps>(
  function Industry_CardRoot(
    {
      image,
      text,
      text2,
      industryCard,
      variant = "default",
      className,
      ...otherProps
    }: Industry_CardRootProps,
    ref
  ) {
    return industryCard ? (
      <SubframeCore.HoverCard.Root>
        <SubframeCore.HoverCard.Trigger asChild={true}>
          <div
            className={SubframeUtils.twClassNames(
              "group/4d073baf flex w-full max-w-[384px] cursor-pointer flex-col items-start gap-8 rounded-md px-12 py-12 hover:bg-neutral-50 hover:shadow-sm",
              {
                "flex-col flex-nowrap gap-6 px-6 py-6": variant === "variation",
              },
              className
            )}
            ref={ref as any}
            {...otherProps}
          >
            {industryCard}
          </div>
        </SubframeCore.HoverCard.Trigger>
        <SubframeCore.HoverCard.Portal>
          <SubframeCore.HoverCard.Content
            side="bottom"
            align="center"
            sideOffset={4}
            asChild={true}
          >
            <div className="flex flex-col items-start gap-1 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-3 shadow-lg" />
          </SubframeCore.HoverCard.Content>
        </SubframeCore.HoverCard.Portal>
      </SubframeCore.HoverCard.Root>
    ) : null;
  }
);

const Industry_Card = Industry_CardRoot;
