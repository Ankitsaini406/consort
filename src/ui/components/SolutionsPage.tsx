"use client";
/*
 * Documentation:
 * Solutions Page — https://app.subframe.com/bbaea32c4115/library?component=Solutions+Page_e9b57175-3a68-44a7-8c92-ea6690bc603f
 * Icon Button — https://app.subframe.com/bbaea32c4115/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Button3 — https://app.subframe.com/bbaea32c4115/library?component=Button3_41944147-8f2e-45ff-a495-d4875411f68d
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherSun } from "@subframe/core";
import { FeatherSpeech } from "@subframe/core";
import { FeatherGitFork } from "@subframe/core";
import { FeatherMonitorSpeaker } from "@subframe/core";
import { FeatherCheckCheck } from "@subframe/core";
import { FeatherBatteryFull } from "@subframe/core";
import { FeatherArrowRight } from "@subframe/core";
import { IconButton } from "./IconButton";
import { Button3 } from "./Button3";
import { FeatherDownload } from "@subframe/core";
import Image from "next/image";

interface SolutionsPageRootProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  image2?: string;
  text?: React.ReactNode;
  icon?: React.ReactNode;
  image3?: string;
  text2?: React.ReactNode;
  text3?: React.ReactNode;
  text4?: React.ReactNode;
  text5?: React.ReactNode;
  text6?: React.ReactNode;
  text7?: React.ReactNode;
  text8?: React.ReactNode;
  text9?: React.ReactNode;
  text10?: React.ReactNode;
  text11?: React.ReactNode;
  icon2?: React.ReactNode;
  text12?: React.ReactNode;
  icon3?: React.ReactNode;
  text13?: React.ReactNode;
  icon4?: React.ReactNode;
  text14?: React.ReactNode;
  icon5?: React.ReactNode;
  text15?: React.ReactNode;
  icon6?: React.ReactNode;
  text16?: React.ReactNode;
  text17?: React.ReactNode;
  image4?: string;
  image5?: string;
  image6?: string;
  image7?: string;
  image8?: string;
  image9?: string;
  text18?: React.ReactNode;
  image10?: string;
  text19?: React.ReactNode;
  text20?: React.ReactNode;
  icon7?: React.ReactNode;
  image11?: string;
  text21?: React.ReactNode;
  text22?: React.ReactNode;
  icon8?: React.ReactNode;
  image12?: string;
  text23?: React.ReactNode;
  text24?: React.ReactNode;
  icon9?: React.ReactNode;
  image13?: string;
  text25?: React.ReactNode;
  text26?: React.ReactNode;
  icon10?: React.ReactNode;
  image14?: string;
  text27?: React.ReactNode;
  text28?: React.ReactNode;
  icon11?: React.ReactNode;
  text29?: React.ReactNode;
  image15?: string;
  text30?: React.ReactNode;
  text31?: React.ReactNode;
  image16?: string;
  text32?: React.ReactNode;
  text33?: React.ReactNode;
  image17?: string;
  text34?: React.ReactNode;
  text35?: React.ReactNode;
  text36?: React.ReactNode;
  text37?: React.ReactNode;
  className?: string;
}

const SolutionsPageRoot = React.forwardRef<HTMLDivElement, SolutionsPageRootProps>(
  function SolutionsPageRoot(
    {
      image,
      image2,
      text,
      icon = <FeatherSun />,
      image3,
      text2,
      text3,
      text4,
      text5,
      text6,
      text7,
      text8,
      text9,
      text10,
      text11,
      icon2 = <FeatherSpeech />,
      text12,
      icon3 = <FeatherGitFork />,
      text13,
      icon4 = <FeatherMonitorSpeaker />,
      text14,
      icon5 = <FeatherCheckCheck />,
      text15,
      icon6 = <FeatherBatteryFull />,
      text16,
      text17,
      image4,
      image5,
      image6,
      image7,
      image8,
      image9,
      text18,
      image10,
      text19,
      text20,
      icon7 = <FeatherArrowRight />,
      image11,
      text21,
      text22,
      icon8 = <FeatherArrowRight />,
      image12,
      text23,
      text24,
      icon9 = <FeatherArrowRight />,
      image13,
      text25,
      text26,
      icon10 = <FeatherArrowRight />,
      image14,
      text27,
      text28,
      icon11 = <FeatherArrowRight />,
      text29,
      image15,
      text30,
      text31,
      image16,
      text32,
      text33,
      image17,
      text34,
      text35,
      text36,
      text37,
      className,
      ...otherProps
    }: SolutionsPageRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "container max-w-none flex h-full w-full flex-col items-center gap-12 bg-default-background py-12",
          className
        )}
        ref={ref as React.RefObject<HTMLDivElement>}
        {...otherProps}
      >
        <div className="flex w-full max-w-[1024px] flex-col items-center gap-2">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-2 relative">
            {image ? (
              <Image
                className="h-112 w-full max-w-[1024px] flex-none rounded-md object-cover"
                src={image}
                alt="Main solution overview"
              />
            ) : null}
            <div className="hidden flex-wrap items-center justify-center gap-6 rounded-md bg-white px-2 py-2 absolute bottom-8 left-8 right-8">
              {image2 ? <Image className="flex-none" src={image2} alt="Secondary solution details" /> : null}
              {text ? (
                <span className="grow shrink-0 basis-0 text-heading-1 font-heading-1 text-consort-red">
                  {text}
                </span>
              ) : null}
              {icon ? (
                <SubframeCore.IconWrapper className="text-heading-2 font-heading-2 text-consort-red">
                  {icon}
                </SubframeCore.IconWrapper>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex max-w-[1024px] flex-col items-center gap-6">
          {image3 ? <Image className="flex-none" src={image3} alt="Additional solution features" /> : null}
          {text2 ? (
            <span className="text-heading-1 font-heading-1 text-default-font">
              {text2}
            </span>
          ) : null}
          {text3 ? (
            <span className="max-w-[768px] text-body-xl font-body-xl text-default-font text-center">
              {text3}
            </span>
          ) : null}
          <div className="flex w-full flex-col items-center justify-center gap-2 px-1 py-1 my-4">
            <div className="flex w-full max-w-[576px] items-start gap-4">
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-1">
                {text4 ? (
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    {text4}
                  </span>
                ) : null}
                {text5 ? (
                  <span className="text-caption font-caption text-subtext-color text-center">
                    {text5}
                  </span>
                ) : null}
              </div>
              <div className="flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border" />
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-1">
                {text6 ? (
                  <span className="text-heading-3 font-heading-3 text-default-font text-center">
                    {text6}
                  </span>
                ) : null}
                {text7 ? (
                  <span className="text-caption font-caption text-subtext-color text-center">
                    {text7}
                  </span>
                ) : null}
              </div>
              <div className="flex w-px flex-none flex-col items-center gap-2 self-stretch bg-neutral-border" />
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-1">
                {text8 ? (
                  <span className="text-heading-3 font-heading-3 text-default-font text-center">
                    {text8}
                  </span>
                ) : null}
                {text9 ? (
                  <span className="text-caption font-caption text-subtext-color text-center">
                    {text9}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md bg-neutral-50 px-6 pt-8 pb-6">
              {text10 ? (
                <span className="w-full text-body-lg-bold font-body-lg-bold text-default-font text-center">
                  {text10}
                </span>
              ) : null}
              {text11 ? (
                <span className="max-w-[768px] text-body-lg font-body-lg text-default-font text-center">
                  {text11}
                </span>
              ) : null}
              <div className="flex w-full grow shrink-0 basis-0 flex-wrap items-start gap-4">
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
                  {icon2 ? (
                    <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-default-font">
                      {icon2}
                    </SubframeCore.IconWrapper>
                  ) : null}
                  {text12 ? (
                    <span className="text-body-bold font-body-bold text-default-font">
                      {text12}
                    </span>
                  ) : null}
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
                  {icon3 ? (
                    <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-default-font">
                      {icon3}
                    </SubframeCore.IconWrapper>
                  ) : null}
                  {text13 ? (
                    <span className="text-body-bold font-body-bold text-default-font">
                      {text13}
                    </span>
                  ) : null}
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
                  {icon4 ? (
                    <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-default-font">
                      {icon4}
                    </SubframeCore.IconWrapper>
                  ) : null}
                  {text14 ? (
                    <span className="text-body-bold font-body-bold text-default-font">
                      {text14}
                    </span>
                  ) : null}
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
                  {icon5 ? (
                    <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-default-font">
                      {icon5}
                    </SubframeCore.IconWrapper>
                  ) : null}
                  {text15 ? (
                    <span className="text-body-bold font-body-bold text-default-font">
                      {text15}
                    </span>
                  ) : null}
                </div>
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
                  {icon6 ? (
                    <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-default-font">
                      {icon6}
                    </SubframeCore.IconWrapper>
                  ) : null}
                  {text16 ? (
                    <span className="text-body-bold font-body-bold text-default-font">
                      {text16}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-6 rounded-md bg-neutral-50 px-12 pt-8 pb-9">
              {text17 ? (
                <span className="w-full text-body-xl font-body-xl text-default-font text-center -tracking-[0.035em]">
                  {text17}
                </span>
              ) : null}
              <div className="flex w-full flex-wrap items-center justify-center gap-12">
                {image4 ? (
                  <Image
                    className="h-12 flex-none object-cover grayscale opacity-50"
                    src={image4}
                    alt="First partner"
                  />
                ) : null}
                {image5 ? (
                  <Image
                    className="h-12 flex-none object-cover grayscale opacity-50"
                    src={image5}
                    alt="Second partner"
                  />
                ) : null}
                {image6 ? (
                  <Image
                    className="h-12 flex-none object-cover grayscale opacity-50"
                    src={image6}
                    alt="Third partner"
                  />
                ) : null}
                {image7 ? (
                  <Image
                    className="h-12 flex-none object-cover grayscale opacity-50"
                    src={image7}
                    alt="Fourth partner"
                  />
                ) : null}
                {image8 ? (
                  <Image
                    className="h-12 flex-none object-cover grayscale opacity-50"
                    src={image8}
                    alt="Fifth partner"
                  />
                ) : null}
                {image9 ? (
                  <Image
                    className="h-12 flex-none object-cover grayscale opacity-50"
                    src={image9}
                    alt="Sixth partner"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-[1024px] flex-col items-center justify-center gap-9 bg-default-background">
          {text18 ? (
            <span className="text-heading-2 font-heading-2 text-default-font">
              {text18}
            </span>
          ) : null}
          <div className="flex w-full max-w-[1024px] flex-wrap items-start justify-center gap-6">
            <div className="flex min-w-[240px] max-w-[576px] grow shrink-0 basis-0 flex-col items-start gap-2 rounded-2xl bg-neutral-50">
              <div className="flex h-80 w-full flex-none flex-col items-center justify-center gap-24 overflow-hidden rounded-xl">
                {image10 ? (
                  <Image
                    className="w-full grow shrink-0 basis-0 object-cover"
                    src={image10}
                    alt={String(text19 || "Solution feature")}
                  />
                ) : null}
              </div>
              <div className="flex w-full flex-col items-start gap-4 px-4 py-4">
                {text19 ? (
                  <span className="w-full text-body-lg-bold font-body-lg-bold text-default-font -tracking-[0.035em]">
                    {text19}
                  </span>
                ) : null}
                <div className="flex items-center gap-2">
                  {text20 ? (
                    <span className="whitespace-pre-wrap font-['Inter'] text-[16px] font-[500] leading-[24px] text-default-font -tracking-[0.01em]">
                      {text20}
                    </span>
                  ) : null}
                  {icon7 ? (
                    <SubframeCore.IconWrapper className="text-body font-body text-default-font">
                      {icon7}
                    </SubframeCore.IconWrapper>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex min-w-[240px] max-w-[576px] grow shrink-0 basis-0 flex-col items-start gap-2 rounded-2xl bg-neutral-50">
              <div className="flex h-80 w-full flex-none flex-col items-center justify-center gap-24 overflow-hidden rounded-xl">
                {image11 ? (
                  <Image
                    className="w-full grow shrink-0 basis-0 object-cover"
                    src={image11}
                    alt={String(text21 || "Solution feature")}
                  />
                ) : null}
              </div>
              <div className="flex w-full flex-col items-start gap-4 px-4 py-4">
                {text21 ? (
                  <span className="w-full text-body-lg-bold font-body-lg-bold text-default-font -tracking-[0.035em]">
                    {text21}
                  </span>
                ) : null}
                <div className="flex items-center gap-2">
                  {text22 ? (
                    <span className="whitespace-pre-wrap font-['Inter'] text-[16px] font-[500] leading-[24px] text-default-font -tracking-[0.01em]">
                      {text22}
                    </span>
                  ) : null}
                  {icon8 ? (
                    <SubframeCore.IconWrapper className="text-body font-body text-default-font">
                      {icon8}
                    </SubframeCore.IconWrapper>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex min-w-[240px] max-w-[576px] grow shrink-0 basis-0 flex-col items-start gap-2 rounded-2xl bg-neutral-50">
              <div className="flex h-80 w-full flex-none flex-col items-center justify-center gap-24 overflow-hidden rounded-xl">
                {image12 ? (
                  <Image
                    className="w-full grow shrink-0 basis-0 object-cover"
                    src={image12}
                    alt={String(text23 || "Solution feature")}
                  />
                ) : null}
              </div>
              <div className="flex w-full flex-col items-start gap-4 px-4 py-4">
                {text23 ? (
                  <span className="w-full text-body-lg-bold font-body-lg-bold text-default-font -tracking-[0.035em]">
                    {text23}
                  </span>
                ) : null}
                <div className="flex items-center gap-2">
                  {text24 ? (
                    <span className="whitespace-pre-wrap font-['Inter'] text-[16px] font-[500] leading-[24px] text-default-font -tracking-[0.01em]">
                      {text24}
                    </span>
                  ) : null}
                  {icon9 ? (
                    <SubframeCore.IconWrapper className="text-body font-body text-default-font">
                      {icon9}
                    </SubframeCore.IconWrapper>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex min-w-[240px] max-w-[576px] grow shrink-0 basis-0 flex-col items-start gap-2 rounded-2xl bg-neutral-50">
              <div className="flex h-80 w-full flex-none flex-col items-center justify-center gap-24 overflow-hidden rounded-xl">
                {image13 ? (
                  <Image
                    className="w-full grow shrink-0 basis-0 object-cover"
                    src={image13}
                    alt={String(text25 || "Solution feature")}
                  />
                ) : null}
              </div>
              <div className="flex w-full flex-col items-start gap-4 px-4 py-4">
                {text25 ? (
                  <span className="w-full text-body-lg-bold font-body-lg-bold text-default-font -tracking-[0.035em]">
                    {text25}
                  </span>
                ) : null}
                <div className="flex items-center gap-2">
                  {text26 ? (
                    <span className="whitespace-pre-wrap font-['Inter'] text-[16px] font-[500] leading-[24px] text-default-font -tracking-[0.01em]">
                      {text26}
                    </span>
                  ) : null}
                  {icon10 ? (
                    <SubframeCore.IconWrapper className="text-body font-body text-default-font">
                      {icon10}
                    </SubframeCore.IconWrapper>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex min-w-[240px] max-w-[576px] grow shrink-0 basis-0 flex-col items-start gap-2 rounded-2xl bg-neutral-50">
              <div className="flex h-80 w-full flex-none flex-col items-center justify-center gap-24 overflow-hidden rounded-xl">
                {image14 ? (
                  <Image
                    className="w-full grow shrink-0 basis-0 object-cover"
                    src={image14}
                    alt={String(text27 || "Solution feature")}
                  />
                ) : null}
              </div>
              <div className="flex w-full flex-col items-start gap-4 px-4 py-4">
                {text27 ? (
                  <span className="w-full text-body-lg-bold font-body-lg-bold text-default-font -tracking-[0.035em]">
                    {text27}
                  </span>
                ) : null}
                <div className="flex items-center gap-2">
                  {text28 ? (
                    <span className="whitespace-pre-wrap font-['Inter'] text-[16px] font-[500] leading-[24px] text-default-font -tracking-[0.01em]">
                      {text28}
                    </span>
                  ) : null}
                  {icon11 ? (
                    <SubframeCore.IconWrapper className="text-body font-body text-default-font">
                      {icon11}
                    </SubframeCore.IconWrapper>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-[1024px] flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
          {text29 ? (
            <span className="w-full text-heading-3 font-heading-3 text-default-font text-center">
              {text29}
            </span>
          ) : null}
          <div className="flex w-full items-start gap-6 px-6 py-6">
            <div className="flex grow shrink-0 basis-0 flex-col items-start rounded-md">
              {image15 ? (
                <Image
                  className="h-48 w-full flex-none rounded-md object-cover"
                  src={image15}
                  alt={String(text30 || "Related content")}
                />
              ) : null}
              <div className="flex w-full flex-col items-start gap-2 px-4 py-4">
                <div className="flex w-full items-center gap-2">
                  {text30 ? (
                    <span className="text-body-bold font-body-bold text-default-font">
                      {text30}
                    </span>
                  ) : null}
                  <IconButton size="small" icon={<FeatherArrowRight />} />
                </div>
                {text31 ? (
                  <span className="line-clamp-2 text-body font-body text-subtext-color">
                    {text31}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 flex-col items-start rounded-md">
              {image16 ? (
                <Image
                  className="h-48 w-full flex-none rounded-md object-cover"
                  src={image16}
                  alt={String(text32 || "Related content")}
                />
              ) : null}
              <div className="flex w-full flex-col items-start gap-2 px-4 py-4">
                <div className="flex w-full items-center justify-between">
                  {text32 ? (
                    <span className="text-body-bold font-body-bold text-default-font">
                      {text32}
                    </span>
                  ) : null}
                  <IconButton size="small" icon={<FeatherArrowRight />} />
                </div>
                {text33 ? (
                  <span className="line-clamp-2 text-body font-body text-subtext-color">
                    {text33}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 flex-col items-start rounded-md">
              {image17 ? (
                <Image
                  className="h-48 w-full flex-none rounded-md object-cover"
                  src={image17}
                  alt={String(text34 || "Related content")}
                />
              ) : null}
              <div className="flex w-full flex-col items-start gap-2 px-4 py-4">
                <div className="flex w-full items-center justify-between">
                  {text34 ? (
                    <span className="text-body-bold font-body-bold text-default-font">
                      {text34}
                    </span>
                  ) : null}
                  <IconButton size="small" icon={<FeatherArrowRight />} />
                </div>
                {text35 ? (
                  <span className="line-clamp-2 text-body font-body text-subtext-color">
                    {text35}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-12 bg-default-background">
          <div className="flex w-full max-w-[1024px] flex-col items-center justify-center gap-12 rounded-2xl bg-neutral-900 px-12 pt-24 pb-16">
            <div className="flex w-full max-w-[768px] flex-col items-center justify-center gap-4">
              {text36 ? (
                <span className="w-full text-heading-1 font-heading-1 text-white text-center -tracking-[0.035em]">
                  {text36}
                </span>
              ) : null}
              {text37 ? (
                <span className="w-full whitespace-pre-wrap text-body-xl font-body-xl text-neutral-400 text-center -tracking-[0.025em]">
                  {text37}
                </span>
              ) : null}
            </div>
            <div className="flex items-center justify-center gap-9">
              <Button3
                variant="destructive-primary"
                size="large"
                iconRight={<FeatherArrowRight />}
              >
                Speak to Expert
              </Button3>
              <Button3
                variant="destructive-secondary"
                size="large"
                iconRight={<FeatherDownload />}
              >
                Download Datasheet
              </Button3>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const SolutionsPage = SolutionsPageRoot;
