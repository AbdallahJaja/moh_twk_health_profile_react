// src/context/AnalyticsContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAnalytics } from "../hooks/useAnalytics";

interface AnalyticsContextProps {
  trackClickEvent: (
    element: HTMLElement,
    customParams?: Record<string, any>
  ) => void;
}

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(
  undefined
);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { trackClick, trackPageView } = useAnalytics();
  const navigate = useNavigate();
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);

  // Track page views
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      trackPageView(
        document.title || location.pathname,
        location.pathname + location.search
      );
      prevPathRef.current = location.pathname;
    }
  }, [location, trackPageView]);

  // Helper to detect if an element is interactive/clickable
  const isInteractiveElement = (element: HTMLElement): boolean => {
    const interactiveTags = [
      "A",
      "BUTTON",
      "INPUT",
      "SELECT",
      "TEXTAREA",
      "DETAILS",
      "SUMMARY",
    ];
    const interactiveRoles = [
      "button",
      "link",
      "checkbox",
      "menuitem",
      "tab",
      "radio",
      "option",
    ];

    // Check tag name
    if (interactiveTags.includes(element.tagName)) return true;

    // Check role attribute
    const role = element.getAttribute("role");
    if (role && interactiveRoles.includes(role)) return true;

    // Check for click-related attributes
    if (element.hasAttribute("onclick") || element.hasAttribute("data-click"))
      return true;

    // Check for data-tracking attributes
    if (element.hasAttribute("data-tracking-id")) return true;

    // Check for cursor style
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.cursor === "pointer") return true;

    // Check for tabindex
    if (
      element.hasAttribute("tabindex") &&
      element.getAttribute("tabindex") !== "-1"
    )
      return true;

    return false;
  };

  // Helper to get component identifier from element
  const getComponentIdentifier = (element: HTMLElement): string => {
    // Try to get identifier from data attributes first
    if (element.dataset.trackingId) return element.dataset.trackingId;

    // Try to get from common attributes
    if (element.getAttribute("aria-label"))
      return element.getAttribute("aria-label")!;
    if (element.id) return element.id;
    if (element.getAttribute("name")) return element.getAttribute("name")!;

    // Try to get from data-testid (common in tested applications)
    if (element.getAttribute("data-testid"))
      return element.getAttribute("data-testid")!;

    // For list items, try to get more context
    if (element.tagName === "LI" || element.classList.contains("list-item")) {
      const listContainer = element.closest('ul, ol, [role="list"]');
      const listId =
        listContainer?.id ||
        listContainer?.getAttribute("aria-label") ||
        "unknown-list";
      const itemIndex = Array.from(listContainer?.children || []).indexOf(
        element
      );
      return `${listId}-item-${itemIndex}`;
    }

    // For table cells
    if (element.tagName === "TD" || element.tagName === "TH") {
      const table = element.closest("table");
      const tableId =
        table?.id || table?.getAttribute("aria-label") || "unknown-table";
      const rowIndex =
        (element.parentElement as HTMLTableRowElement)?.rowIndex || 0;
      const cellIndex = (element as HTMLTableCellElement).cellIndex;
      return `${tableId}-cell-${rowIndex}-${cellIndex}`;
    }

    // For cards or sections
    if (element.classList.contains("card") || element.tagName === "SECTION") {
      const sectionTitle = element
        .querySelector("h1, h2, h3, h4, h5, h6")
        ?.textContent?.trim();
      if (sectionTitle) return `section-${sectionTitle}`;
    }

    // Fallback to element type + nearby text content
    const textContent = element.textContent?.trim().substring(0, 20);
    return `${element.tagName.toLowerCase()}${
      textContent ? `-${textContent}` : ""
    }`;
  };

  const getActionType = (element: HTMLElement): string => {
    // Try to determine action type based on element type and attributes
    if (element.tagName === "BUTTON") return "button_click";
    if (element.tagName === "A") return "link_click";
    if (element.tagName === "INPUT") {
      const inputType = element.getAttribute("type");
      if (inputType === "submit" || inputType === "button")
        return "form_submit";
      return "input_interaction";
    }
    if (element.tagName === "LI" || element.classList.contains("list-item"))
      return "list_item_click";
    if (element.tagName === "TR" || element.tagName === "TD")
      return "table_row_click";
    if (element.classList.contains("card")) return "card_click";
    if (element.getAttribute("role") === "tab") return "tab_click";
    if (
      element.classList.contains("accordion") ||
      element.tagName === "SUMMARY"
    )
      return "accordion_toggle";

    return "element_click";
  };

  // Function to get element context
  const getElementContext = (element: HTMLElement): Record<string, any> => {
    const context: Record<string, any> = {};

    // Get parent context
    const section = element.closest("section, [data-section]");
    if (section) {
      context.section =
        section.id ||
        section.getAttribute("data-section") ||
        section.querySelector("h1, h2, h3")?.textContent?.trim() ||
        "unknown-section";
    }

    // Get component context
    const component = element.closest("[data-component]");
    if (component) {
      context.component = component.getAttribute("data-component");
    }

    // For list items, add list context
    const listContainer = element.closest('ul, ol, [role="list"]');
    if (listContainer) {
      context.list_id = listContainer.id || "unknown-list";
      const listItems = Array.from(listContainer.children);
      context.item_index = listItems.indexOf(element);
      context.list_length = listItems.length;
    }

    // For table rows, add table context
    const tableRow = element.closest("tr");
    if (tableRow) {
      const table = element.closest("table");
      context.table_id = table?.id || "unknown-table";
      context.row_index = (tableRow as HTMLTableRowElement).rowIndex;
    }

    return context;
  };

  // Function to track click events
  const trackClickEvent = (
    element: HTMLElement,
    customParams: Record<string, any> = {}
  ) => {
    const componentId = getComponentIdentifier(element);
    const actionType = getActionType(element);
    const elementContext = getElementContext(element);

    const params: Record<string, any> = {
      element_type: element.tagName.toLowerCase(),
      element_text: element.textContent?.trim().substring(0, 50) || "",
      element_path: location.pathname,
      ...elementContext,
      ...customParams,
    };

    // Add data attributes as params
    Object.keys(element.dataset).forEach((key) => {
      if (key.startsWith("track") && key !== "trackingId") {
        const paramKey = key.replace(/^track/, "").toLowerCase();
        params[paramKey] = element.dataset[key];
      }
    });

    trackClick(componentId, actionType, params);
  };

  // Setup global click handler
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find the clicked element
      const target = e.target as HTMLElement;
      if (!target) return;

      // Find the nearest interactive element (going up the DOM tree)
      let currentElement: HTMLElement | null = target;
      let interactiveElement: HTMLElement | null = null;

      // Maximum levels to traverse up
      const MAX_LEVELS = 5;
      let level = 0;

      // Traverse up to find the nearest interactive element
      while (currentElement && level < MAX_LEVELS) {
        if (isInteractiveElement(currentElement)) {
          interactiveElement = currentElement;
          break;
        }

        currentElement = currentElement.parentElement;
        level++;
      }

      // If we found an interactive element, track the click
      if (interactiveElement) {
        trackClickEvent(interactiveElement);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [location]);

  return (
    <AnalyticsContext.Provider value={{ trackClickEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error(
      "useAnalyticsContext must be used within an AnalyticsProvider"
    );
  }
  return context;
};
