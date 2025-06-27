"use client";
/*
 * Documentation:
 * Select Consort — https://app.subframe.com/bbaea32c4115/library?component=Select+Consort_93a858ba-7650-48c2-adf8-cac119813df4
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";

interface ItemProps
  extends Omit<React.ComponentProps<typeof SubframeCore.Select.Item>, "value"> {
  value: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const Item = React.forwardRef<HTMLElement, ItemProps>(function Item(
  { value, children, className, ...otherProps }: ItemProps,
  ref
) {
  return (
    <SubframeCore.Select.Item
      value={value as string}
      asChild={true}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "group/7ea29eca flex h-8 w-full cursor-pointer items-center gap-1 rounded-sm px-3 hover:rounded-sm hover:bg-neutral-100 active:bg-neutral-50 data-[highlighted]:rounded-sm data-[highlighted]:bg-brand-50",
          className
        )}
        ref={ref as any}
      >
        <SelectConsort.ItemText className="h-auto grow shrink-0 basis-0">
          {children || value}
        </SelectConsort.ItemText>
        <FeatherCheck className="hidden text-body font-body text-default-font group-hover/7ea29eca:hidden group-data-[state=checked]/7ea29eca:inline-flex group-data-[state=checked]/7ea29eca:text-brand-600" />
      </div>
    </SubframeCore.Select.Item>
  );
});

interface TriggerValueProps
  extends React.ComponentProps<typeof SubframeCore.Select.Value> {
  placeholder?: React.ReactNode;
  className?: string;
}

const TriggerValue = React.forwardRef<HTMLElement, TriggerValueProps>(
  function TriggerValue(
    { placeholder, className, ...otherProps }: TriggerValueProps,
    ref
  ) {
    return (
      <SubframeCore.Select.Value
        className={SubframeUtils.twClassNames(
          "w-full whitespace-nowrap text-body font-body text-default-font",
          className
        )}
        ref={ref as any}
        placeholder={placeholder}
        {...otherProps}
      >
        Value
      </SubframeCore.Select.Value>
    );
  }
);

interface ContentProps
  extends React.ComponentProps<typeof SubframeCore.Select.Content> {
  children?: React.ReactNode;
  className?: string;
}

const Content = React.forwardRef<HTMLElement, ContentProps>(function Content(
  { children, className, ...otherProps }: ContentProps,
  ref
) {
  return children ? (
    <SubframeCore.Select.Content asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start gap-2 overflow-hidden rounded-sm bg-white px-1 py-1 shadow-lg",
          className
        )}
        ref={ref as any}
      >
        {children}
      </div>
    </SubframeCore.Select.Content>
  ) : null;
});

interface TriggerProps
  extends Omit<
    React.ComponentProps<typeof SubframeCore.Select.Trigger>,
    "placeholder"
  > {
  placeholder?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const Trigger = React.forwardRef<HTMLElement, TriggerProps>(function Trigger(
  { placeholder, icon = null, className, ...otherProps }: TriggerProps,
  ref
) {
  return (
    <SubframeCore.Select.Trigger asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "flex h-full w-full items-center gap-2 px-3",
          className
        )}
        ref={ref as any}
      >
        {icon ? (
          <SubframeCore.IconWrapper className="text-body font-body text-neutral-400">
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        <SelectConsort.TriggerValue placeholder={placeholder as string} />
        <FeatherChevronDown className="text-body font-body text-subtext-color" />
      </div>
    </SubframeCore.Select.Trigger>
  );
});

interface ItemTextProps
  extends React.ComponentProps<typeof SubframeCore.Select.ItemText> {
  children?: React.ReactNode;
  className?: string;
}

const ItemText = React.forwardRef<HTMLElement, ItemTextProps>(function ItemText(
  { children, className, ...otherProps }: ItemTextProps,
  ref
) {
  return children ? (
    <SubframeCore.Select.ItemText {...otherProps}>
      <span
        className={SubframeUtils.twClassNames(
          "text-body font-body text-default-font",
          className
        )}
        ref={ref as any}
      >
        {children}
      </span>
    </SubframeCore.Select.ItemText>
  ) : null;
});

interface SelectConsortRootProps
  extends React.ComponentProps<typeof SubframeCore.Select.Root> {
  disabled?: boolean;
  error?: boolean;
  variant?: "outline" | "filled";
  label?: React.ReactNode;
  placeholder?: React.ReactNode;
  helpText?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const SelectConsortRoot = React.forwardRef<HTMLElement, SelectConsortRootProps>(
  function SelectConsortRoot(
    {
      disabled = false,
      error = false,
      variant = "outline",
      label,
      placeholder,
      helpText,
      icon = null,
      children,
      className,
      value,
      defaultValue,
      onValueChange,
      open,
      defaultOpen,
      onOpenChange,
      dir,
      name,
      autoComplete,
      required,
      form,
      ...otherProps
    }: SelectConsortRootProps,
    ref
  ) {
    return (
      <SubframeCore.Select.Root
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        dir={dir}
        name={name}
        autoComplete={autoComplete}
        required={required}
        form={form}
      >
        <div
          className={SubframeUtils.twClassNames(
            "group/93a858ba flex cursor-pointer flex-col items-start gap-2",
            className
          )}
          ref={ref as any}
          {...otherProps}
        >
          {label ? (
            <span className="text-caption-bold font-caption-bold text-default-font">
              {label}
            </span>
          ) : null}
          <div
            className={SubframeUtils.twClassNames(
              "flex h-8 w-full flex-none flex-col items-start rounded-sm border border-solid border-neutral-border bg-default-background group-focus-within/93a858ba:border group-focus-within/93a858ba:border-solid group-focus-within/93a858ba:border-brand-primary",
              {
                "border border-solid border-neutral-100 bg-neutral-100 group-hover/93a858ba:border group-hover/93a858ba:border-solid group-hover/93a858ba:border-neutral-border group-hover/93a858ba:bg-neutral-100":
                  variant === "filled",
                "border border-solid border-error-600 bg-red-50": error,
                "bg-neutral-200": disabled,
              }
            )}
          >
            <Trigger placeholder={placeholder} icon={icon} />
          </div>
          {helpText ? (
            <span
              className={SubframeUtils.twClassNames(
                "text-caption font-caption text-subtext-color",
                { "text-error-700": error }
              )}
            >
              {helpText}
            </span>
          ) : null}
          <Content>
            {children ? (
              <div className="flex w-full grow shrink-0 basis-0 flex-col items-start">
                {children}
              </div>
            ) : null}
          </Content>
        </div>
      </SubframeCore.Select.Root>
    );
  }
);

export const SelectConsort = Object.assign(SelectConsortRoot, {
  Item,
  TriggerValue,
  Content,
  Trigger,
  ItemText,
});
