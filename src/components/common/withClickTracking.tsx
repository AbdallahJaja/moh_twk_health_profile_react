// src/components/common/withClickTracking.tsx
import React, { ComponentType } from "react";
import { useAnalytics } from "../../hooks/useAnalytics";

interface WithClickTrackingProps {
  componentName?: string;
  actionName?: string;
  trackingParams?: Record<string, any>;
}

export function withClickTracking<P extends object>(
  WrappedComponent: ComponentType<P>,
  defaultProps: WithClickTrackingProps = {}
) {
  const WithClickTracking: React.FC<P & WithClickTrackingProps> = (props) => {
    const { trackClick } = useAnalytics();
    const {
      componentName = defaultProps.componentName ||
        WrappedComponent.displayName ||
        WrappedComponent.name,
      actionName = defaultProps.actionName || "click",
      trackingParams = defaultProps.trackingParams || {},
      ...rest
    } = props;

    const handleClick = (e: React.MouseEvent) => {
      // Track the click
      trackClick(componentName, actionName, trackingParams);

      // Call the original onClick handler if it exists
      if ("onClick" in rest && typeof rest.onClick === "function") {
        rest.onClick(e);
      }
    };

    return <WrappedComponent {...(rest as P)} onClick={handleClick} />;
  };

  WithClickTracking.displayName = `WithClickTracking(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;
  return WithClickTracking;
}
