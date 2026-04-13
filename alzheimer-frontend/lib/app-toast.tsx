"use client";

import hotToast from "react-hot-toast";

export type AppToastOptions = {
  description?: string;
  duration?: number;
  id?: string;
};

function body(message: string, opts?: AppToastOptions) {
  if (!opts?.description) return message;
  return (
    <div className="flex flex-col gap-1 pr-1">
      <span className="font-semibold leading-snug text-neutral-900">{message}</span>
      <span className="text-[13px] font-normal leading-snug text-neutral-600">{opts.description}</span>
    </div>
  );
}

/** App-wide toast API (react-hot-toast), bottom-right via `<HotToaster />`. */
export const toast = {
  success: (message: string, opts?: AppToastOptions) =>
    hotToast.success(body(message, opts), {
      id: opts?.id,
      duration: opts?.duration,
    }),

  error: (message: string, opts?: AppToastOptions) =>
    hotToast.error(body(message, opts), {
      id: opts?.id,
      duration: opts?.duration,
    }),

  loading: (message: string, opts?: Pick<AppToastOptions, "id">) =>
    hotToast.loading(message, { id: opts?.id }),

  /** Neutral / info (no green check). */
  message: (message: string, opts?: AppToastOptions) =>
    hotToast(body(message, opts), {
      id: opts?.id,
      duration: opts?.duration ?? 3200,
      icon: null,
    }),

  dismiss: (toastId?: string) => hotToast.dismiss(toastId),
  promise: hotToast.promise,
};
