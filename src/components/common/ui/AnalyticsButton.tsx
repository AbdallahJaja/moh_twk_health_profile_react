// src/components/common/ui/AnalyticsButton.tsx
import React from "react";
import { useAnalytics } from "../../../hooks/useAnalytics";

interface AnalyticsButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  trackingId?: string;
  actionName?: string;
  trackingParams?: Record<string, any>;
}

export const AnalyticsButton: React.FC<AnalyticsButtonProps> = ({
  trackingId,
  actionName = "click",
  trackingParams = {},
  onClick,
  children,
  ...props
}) => {
  const { trackClick } = useAnalytics();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Track click event
    trackClick(
      trackingId || props.id || props["aria-label"] || "unknown-button",
      actionName,
      trackingParams
    );

    // Call original onClick if provided
    if (onClick) onClick(e);
  };

  return (
    <button {...props} data-tracking-id={trackingId} onClick={handleClick}>
      {children}
    </button>
  );
};
