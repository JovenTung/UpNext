'use client'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

export default function PreviewModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
                <Dialog.Title className="text-lg font-semibold">
                  Sample Plan Preview
                </Dialog.Title>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <p>
                    <strong>Assignment:</strong> Research essay — due in 7 days
                  </p>
                  <p>
                    <strong>Planned sessions:</strong> 4 x 90min sessions
                    scheduled over next 4 days
                  </p>
                  <div className="rounded-md border bg-slate-50 p-3">
                    <ul className="space-y-2 text-xs">
                      <li>Day 1 — Read & outline (90m)</li>
                      <li>Day 2 — Research (90m)</li>
                      <li>Day 3 — Draft (90m)</li>
                      <li>Day 4 — Edit & submit (60m)</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    className="mr-2 rounded-md px-4 py-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                  <button
                    className="rounded-md bg-primary px-4 py-2 text-white"
                    onClick={() => {
                      onClose() /* optionally route to sign-in or add-demo assignment */
                    }}
                  >
                    Use this plan
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
