import React from 'react';

interface ServiceFilterProps {
  services: string[];
  activeFilter: string | null;
  onFilterChange: (service: string | null) => void;
}

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
