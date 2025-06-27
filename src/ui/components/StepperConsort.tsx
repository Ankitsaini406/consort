"use client";
/*
 * Documentation:
 * Stepper Consort — https://app.subframe.com/bbaea32c4115/library?component=Stepper+Consort_cef59f3a-d6c7-4464-9b01-6212db51ecf7
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "completed" | "active" | "incomplete";
  firstStep?: boolean;
  lastStep?: boolean;
  stepNumber?: React.ReactNode;
  label?: React.ReactNode;
  className?: string;
}

const Step = React.forwardRef<HTMLElement, StepProps>(function Step(
  {
    variant = "default",
    firstStep = false,
    lastStep = false,
    stepNumber,
    label,
    className,
    ...otherProps
  }: StepProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/caa6154d flex w-full cursor-pointer flex-col items-center justify-center gap-2",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full items-center justify-center gap-2",
          { "flex-row flex-nowrap gap-2": firstStep }
        )}
      >
        <div
          className={SubframeUtils.twClassNames(
            "flex h-px grow shrink-0 basis-0 flex-col items-center gap-2 bg-neutral-300",
            { "bg-transparent": firstStep }
          )}
        />
        <div
          className={SubframeUtils.twClassNames(
            "flex h-7 w-7 flex-none flex-col items-center justify-center gap-2 rounded-sm bg-neutral-100",
            {
              "bg-red-50": variant === "incomplete",
              "bg-brand-100": variant === "active",
              "bg-success-200": variant === "completed",
            }
          )}
        >
          {stepNumber ? (
            <span
              className={SubframeUtils.twClassNames(
                "text-caption-bold font-caption-bold text-subtext-color",
                {
                  "text-error-700": variant === "incomplete",
                  "text-brand-700":
                    variant === "active" || variant === "completed",
                }
              )}
            >
              {stepNumber}
            </span>
          ) : null}
        </div>
        <div
          className={SubframeUtils.twClassNames(
            "flex h-px grow shrink-0 basis-0 flex-col items-center gap-2 bg-neutral-300",
            { "bg-transparent": lastStep }
          )}
        />
      </div>
      {label ? (
        <span
          className={SubframeUtils.twClassNames(
            "text-body font-body text-subtext-color group-hover/caa6154d:text-default-font",
            {
              "text-error-700": variant === "incomplete",
              "text-body-bold font-body-bold text-consort-blue":
                variant === "active",
              "text-success-700": variant === "completed",
            }
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
});

interface StepperConsortRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const StepperConsortRoot = React.forwardRef<
  HTMLElement,
  StepperConsortRootProps
>(function StepperConsortRoot(
  { children, className, ...otherProps }: StepperConsortRootProps,
  ref
) {
  return children ? (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full items-start justify-center",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {children}
    </div>
  ) : null;
});

const StepperConsort = Object.assign(StepperConsortRoot, {
  Step,
});
