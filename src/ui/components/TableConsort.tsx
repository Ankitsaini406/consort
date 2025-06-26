"use client";
/*
 * Documentation:
 * Table Consort — https://app.subframe.com/bbaea32c4115/library?component=Table+Consort_2e8cd610-fac5-4b1f-b168-cb76ea8bee6f
 * Badge — https://app.subframe.com/bbaea32c4115/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 * Dropdown Menu — https://app.subframe.com/bbaea32c4115/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Icon Button — https://app.subframe.com/bbaea32c4115/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { DropdownMenu } from "./DropdownMenu";
import * as SubframeCore from "@subframe/core";

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode;
  clickable?: boolean;
  className?: string;
}

const Row = React.forwardRef<HTMLElement, RowProps>(function Row(
  { children, clickable = false, className, ...otherProps }: RowProps,
  ref
) {
  return (
    <tr
      className={SubframeUtils.twClassNames(
        "group/e02b6745 border-t border-solid border-neutral-border",
        { "hover:bg-neutral-50": clickable },
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {children}
    </tr>
  );
});

interface CellProps extends React.TdHTMLAttributes<HTMLTableDataCellElement> {
  children?: React.ReactNode;
  className?: string;
}

const Cell = React.forwardRef<HTMLElement, CellProps>(function Cell(
  { children, className, ...otherProps }: CellProps,
  ref
) {
  return (
    <td {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "flex h-12 w-full items-center gap-1 px-3",
          className
        )}
        ref={ref as any}
      >
        {children}
      </div>
    </td>
  );
});

interface HeaderRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode;
  className?: string;
}

const HeaderRow = React.forwardRef<HTMLElement, HeaderRowProps>(
  function HeaderRow(
    { children, className, ...otherProps }: HeaderRowProps,
    ref
  ) {
    return (
      <tr className={className} ref={ref as any} {...otherProps}>
        {children}
      </tr>
    );
  }
);

interface HeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const HeaderCell = React.forwardRef<HTMLElement, HeaderCellProps>(
  function HeaderCell(
    { children, icon = null, className, ...otherProps }: HeaderCellProps,
    ref
  ) {
    return (
      <th {...otherProps}>
        <div
          className={SubframeUtils.twClassNames(
            "flex h-8 w-full items-center gap-1 px-3",
            className
          )}
          ref={ref as any}
        >
          {children ? (
            <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
              {children}
            </span>
          ) : null}
          {icon ? (
            <SubframeCore.IconWrapper className="text-caption font-caption text-subtext-color">
              {icon}
            </SubframeCore.IconWrapper>
          ) : null}
        </div>
      </th>
    );
  }
);

interface TableConsortRootProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  header?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const TableConsortRoot = React.forwardRef<HTMLElement, TableConsortRootProps>(
  function TableConsortRoot(
    { header, children, className, ...otherProps }: TableConsortRootProps,
    ref
  ) {
    return (
      <table
        className={SubframeUtils.twClassNames("w-full", className)}
        ref={ref as any}
        {...otherProps}
      >
        <thead>{header}</thead>
        <tbody className="border-b border-solid border-neutral-border">
          {children}
        </tbody>
      </table>
    );
  }
);

const TableConsort = Object.assign(TableConsortRoot, {
  Row,
  Cell,
  HeaderRow,
  HeaderCell,
});
