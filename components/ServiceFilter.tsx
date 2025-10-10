import React from 'react';

/**
 * Props for the ServiceFilter component.
 * @interface ServiceFilterProps
 */
interface ServiceFilterProps {
  /** An array of service names to be displayed as filter options. */
  services: string[];
  /** The currently active service filter, or null if no filter is selected. */
  activeFilter: string | null;
  /**
   * Callback function invoked when a service filter is changed.
   * It receives the selected service name, or null to clear the filter.
   * @param {string | null} service - The selected service or null.
   */
  onFilterChange: (service: string | null) => void;
}

/**
 * A horizontal, scrollable filter bar component that displays service options.
 * It allows users to filter a list by selecting a specific service.
 *
 * @param {ServiceFilterProps} props The props for the component.
 * @returns {React.ReactElement} The rendered ServiceFilter component.
 */
const ServiceFilter: React.FC<ServiceFilterProps> = ({ services, activeFilter, onFilterChange }) => {
  return (
    <div className="w-full overflow-x-auto py-1 hide-scrollbar">
       <style>{`
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
      <div className="flex items-center space-x-2 px-4 sm:justify-center">
        <button
          onClick={() => onFilterChange(null)}
          className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 shadow-sm
            ${!activeFilter
              ? 'bg-primary text-primary-content'
              : 'bg-base-100 dark:bg-neutral text-neutral-focus dark:text-base-200 hover:bg-base-200 dark:hover:bg-neutral-focus'
            }`
          }
        >
          All Services
        </button>
        {services.map(service => (
          <button
            key={service}
            onClick={() => onFilterChange(service === activeFilter ? null : service)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 shadow-sm
              ${activeFilter === service
                ? 'bg-primary text-primary-content'
                : 'bg-base-100 dark:bg-neutral text-neutral-focus dark:text-base-200 hover:bg-base-200 dark:hover:bg-neutral-focus'
              }`
            }
          >
            {service}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceFilter;
