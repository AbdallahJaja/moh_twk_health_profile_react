// src/components/common/ui/AnalyticsTable.tsx
import React, { ReactNode } from "react";
import { useAnalytics } from "../../../hooks/useAnalytics";

interface AnalyticsTableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  trackingId: string;
  trackRows?: boolean;
  trackCells?: boolean;
  children: ReactNode;
}

export const AnalyticsTable: React.FC<AnalyticsTableProps> = ({
  trackingId,
  trackRows = true,
  trackCells = false,
  children,
  ...props
}) => {
  return (
    <table
      {...props}
      data-tracking-id={trackingId}
      data-component="analytics-table"
      data-track-rows={trackRows.toString()}
      data-track-cells={trackCells.toString()}
    >
      {children}
    </table>
  );
};

interface AnalyticsTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  trackingId?: string;
  actionType?: string;
  trackingParams?: Record<string, any>;
  children: ReactNode;
}

export const AnalyticsTableRow: React.FC<AnalyticsTableRowProps> = ({
  trackingId,
  actionType = "table_row_click",
  trackingParams = {},
  children,
  onClick,
  ...props
}) => {
  const { trackClick } = useAnalytics();

  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Get table element
    const tableElement = (e.currentTarget as HTMLTableRowElement).closest(
      "table"
    );
    const tableId =
      tableElement?.getAttribute("data-tracking-id") || "unknown-table";
    const rowIndex = (e.currentTarget as HTMLTableRowElement).rowIndex;

    const rowId =
      trackingId || props["data-tracking-id"] || `${tableId}-row-${rowIndex}`;

    trackClick(rowId, actionType, {
      table_id: tableId,
      row_index: rowIndex,
      ...trackingParams,
    });

    if (onClick) onClick(e);
  };

  return (
    <tr
      {...props}
      data-tracking-id={trackingId || props["data-tracking-id"]}
      onClick={handleClick}
      style={{ cursor: "pointer", ...props.style }}
    >
      {children}
    </tr>
  );
};

// Cell component could be added if needed for cell-level tracking
