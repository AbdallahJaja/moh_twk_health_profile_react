// src/components/common/ui/AnalyticsList.tsx
import React, { ReactNode } from "react";
import { useAnalytics } from "../../../hooks/useAnalytics";

interface AnalyticsListProps extends React.HTMLAttributes<HTMLUListElement> {
  trackingId: string;
  listType?: "list" | "grid" | "menu";
  itemTrackingPrefix?: string;
  children: ReactNode;
}

export const AnalyticsList: React.FC<AnalyticsListProps> = ({
  trackingId,
  listType = "list",
  itemTrackingPrefix,
  children,
  ...props
}) => {
  return (
    <ul
      {...props}
      data-tracking-id={trackingId}
      data-component="analytics-list"
      data-track-list-type={listType}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            "data-tracking-id":
              child.props["data-tracking-id"] ||
              (itemTrackingPrefix
                ? `${itemTrackingPrefix}-item-${index}`
                : `${trackingId}-item-${index}`),
            "data-track-item-index": index,
            "data-track-list-id": trackingId,
          });
        }
        return child;
      })}
    </ul>
  );
};

interface AnalyticsListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  trackingId?: string;
  actionType?: string;
  trackingParams?: Record<string, any>;
  children: ReactNode;
}

export const AnalyticsListItem: React.FC<AnalyticsListItemProps> = ({
  trackingId,
  actionType = "list_item_click",
  trackingParams = {},
  children,
  onClick,
  ...props
}) => {
  const { trackClick } = useAnalytics();

  const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
    const itemId =
      trackingId || props["data-tracking-id"] || "unknown-list-item";
    const listId = props["data-track-list-id"];
    const itemIndex = props["data-track-item-index"];

    trackClick(itemId, actionType, {
      list_id: listId,
      item_index: itemIndex,
      ...trackingParams,
    });

    if (onClick) onClick(e);
  };

  return (
    <li
      {...props}
      data-tracking-id={trackingId || props["data-tracking-id"]}
      onClick={handleClick}
      style={{ cursor: "pointer", ...props.style }}
    >
      {children}
    </li>
  );
};
