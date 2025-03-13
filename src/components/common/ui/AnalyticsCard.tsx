// src/components/common/ui/AnalyticsCard.tsx
import React, { ReactNode } from "react";
import { useAnalytics } from "../../../hooks/useAnalytics";

interface AnalyticsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  trackingId: string;
  cardType?: string;
  trackingParams?: Record<string, any>;
  children: ReactNode;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  trackingId,
  cardType = "default",
  trackingParams = {},
  children,
  onClick,
  ...props
}) => {
  const { trackClick } = useAnalytics();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    trackClick(trackingId, "card_click", {
      card_type: cardType,
      ...trackingParams,
    });

    if (onClick) onClick(e);
  };

  return (
    <div
      {...props}
      className={`card ${props.className || ""}`}
      data-tracking-id={trackingId}
      data-track-card-type={cardType}
      onClick={handleClick}
      style={{ cursor: "pointer", ...props.style }}
    >
      {children}
    </div>
  );
};
