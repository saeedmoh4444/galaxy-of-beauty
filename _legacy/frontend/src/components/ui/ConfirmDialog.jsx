import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

/**
 * Reusable confirmation modal — replaces window.confirm().
 * @param {{ open: boolean, title: string, message: string, confirmText?: string, cancelText?: string, variant?: 'danger'|'primary', onConfirm: () => void, onCancel: () => void, isLoading?: boolean }} props
 */
export default function ConfirmDialog({ open, title, message, confirmText = 'تأكيد', cancelText = 'إلغاء', variant = 'primary', onConfirm, onCancel, isLoading = false }) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="card max-w-sm w-full text-center">
                <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">{title}</Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500 mb-6">{message}</Dialog.Description>
                <div className="flex gap-3">
                  <button onClick={onCancel} className="btn-ghost flex-1 text-sm py-2.5">{cancelText}</button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex-1 text-sm py-2.5 rounded-lg font-semibold text-white transition-colors disabled:opacity-50
                      ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}
                  >
                    {isLoading ? 'جاري...' : confirmText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
