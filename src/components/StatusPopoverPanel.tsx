'use client';

import React, { Fragment } from 'react'; // Removed useState
import { useFilterStore } from '@/store/filterStore';
import { useUserListStore, ListStatus } from '@/store/userListStore';
import { listButtonConfig, statusConfig } from '@/lib/translations';
import { Popover, Transition } from '@headlessui/react'; // Popover might still be needed for Popover.Panel
import clsx from 'clsx';

interface StatusPopoverPanelProps { // Renamed interface
  animeId: number;
  currentStatus: ListStatus | null;
  isOpen: boolean; // Added isOpen prop
  panelPosition?: 'left' | 'right';
  onMouseEnterPanel?: () => void; // New prop
}

export default function StatusPopoverPanel({ animeId, currentStatus, isOpen, panelPosition = 'right', onMouseEnterPanel }: StatusPopoverPanelProps) { // Updated signature
    const { language } = useFilterStore();
    const { toggleStatus } = useUserListStore();
    // Removed isMenuOpen state and handler functions

    const leftPanelClasses = "absolute right-full top-0 w-max origin-top-right z-30"; // Removed mr-2
    const rightPanelClasses = "absolute left-0 top-0 w-max origin-top-left z-30"; // Removed mt-1, added top-0

    const leftPanelTransitionProps = {
        enter: "transition ease-out duration-200",
        enterFrom: "transform opacity-0 translate-x-4",
        enterTo: "transform opacity-100 translate-x-0",
        leave: "transition ease-in duration-150",
        leaveFrom: "transform opacity-100 translate-x-0",
        leaveTo: "transform opacity-0 translate-x-4",
    };

    const rightPanelTransitionProps = {
        enter: "transition-[clip-path] duration-300 ease-out",
        enterFrom: "[clip-path:circle(0%_at_10px_10px)]",
        enterTo: "[clip-path:circle(150%_at_10px_10px)]",
        leave: "transition-[clip-path] duration-200 ease-in",
        leaveFrom: "[clip-path:circle(150%_at_10px_10px)]",
        leaveTo: "[clip-path:circle(0%_at_10px_10px)]",
    };

    // Removed outer div, Popover, and Popover.Button
    // Component now returns Transition directly
    return (
        <Transition
            as={Fragment}
            show={isOpen} // Controlled by isOpen prop
            {...(panelPosition === 'left' ? leftPanelTransitionProps : rightPanelTransitionProps)}
        >
            <Popover.Panel static className={panelPosition === 'left' ? leftPanelClasses : rightPanelClasses}>
                <div 
                    className="overflow-hidden rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                    onMouseEnter={onMouseEnterPanel} // Applied onMouseEnter
                >
                    <div className="relative flex flex-col bg-surface/80 backdrop-blur-lg border border-white/10 p-1">
                        {listButtonConfig.map(({ label, status: itemStatus }) => ( // Renamed 'status' to 'itemStatus' to avoid conflict
                            <button
                                key={itemStatus}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent event bubbling
                                    toggleStatus(animeId, itemStatus);
                                    // setIsMenuOpen(false); // No longer needed, isOpen is a prop
                                }}
                                className={clsx(
                                    'w-full text-left px-2 py-1 text-xs font-semibold rounded-sm transition-colors',
                                    currentStatus === itemStatus
                                        ? `${statusConfig[itemStatus].buttonColor} ${statusConfig[itemStatus].textColor}`
                                        : 'text-text-main hover:bg-surface'
                                )}
                            >
                                {label[language]}
                            </button>
                        ))}
                    </div>
                </div>
            </Popover.Panel>
        </Transition>
    );
}
