"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX } from "react-icons/fi";
import FileViewer from "./FileViewer";
import { useBodyScroll } from "@/hooks/useBodyScroll";

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName?: string;
}

/**
 * Modal wrapper for the FileViewer component
 * Provides a full-screen overlay for viewing files
 */
export default function FileViewerModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
}: FileViewerModalProps) {
  // Prevent body scroll when modal is open
  useBodyScroll(isOpen);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop with dark overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="flex items-center justify-center h-full p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-7xl h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
                {/* Header with Close Button */}
                <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
                  <Dialog.Title className="text-lg font-bold text-gray-900 truncate">
                    {fileName || "File Viewer"}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close file viewer"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* File Viewer Content */}
                <div className="flex-1 overflow-auto bg-white">
                  <FileViewer
                    fileUrl={fileUrl}
                    fileName={fileName}
                    onClose={onClose}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
