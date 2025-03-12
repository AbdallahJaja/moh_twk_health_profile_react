// src/hooks/useAnalytics.ts
import { useCallback } from "react";
import { logEvent } from "firebase/analytics";
import { analytics } from "../services/firebase/firebaseConfig";
import { env } from "../config/env";

interface EventParams {
  [key: string]: any;
}

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, params?: EventParams) => {
    try {
      // Check if analytics is enabled and initialized
      if (!env.ENABLE_ANALYTICS) {
        console.debug(`Analytics disabled: ${eventName}`, params);
        return;
      }
      
      if (analytics) {
        console.debug(`Tracking event: ${eventName}`, params);
        logEvent(analytics, eventName, {
          timestamp: new Date().toISOString(),
          ...params,
        });
      } else {
        console.debug(`Analytics not initialized: ${eventName}`, params);
      }
    } catch (error) {
      console.error(`Error tracking event ${eventName}:`, error);
    }
  }, []);

  const trackClick = useCallback(
    (
      componentName: string,
      actionName: string,
      additionalParams?: EventParams
    ) => {
      trackEvent("click", {
        component: componentName,
        action: actionName,
        ...additionalParams,
      });
    },
    [trackEvent]
  );

  const trackPageView = useCallback(
    (pageName: string, path: string) => {
      trackEvent("page_view", {
        page_title: pageName,
        page_path: path,
      });
    },
    [trackEvent]
  );

  const trackHealthAction = useCallback(
    (
      category: string,
      type: string,
      action: string,
      additionalParams?: EventParams
    ) => {
      trackEvent("health_action", {
        category,
        type,
        action,
        ...additionalParams,
      });
    },
    [trackEvent]
  );

  return { trackEvent, trackClick, trackPageView, trackHealthAction };
};
