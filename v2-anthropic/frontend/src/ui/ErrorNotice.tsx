import { WarningCircleIcon } from "@phosphor-icons/react";

export default function ErrorNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
    >
      <WarningCircleIcon
        size={18}
        weight="fill"
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      />
      <p>
        {message} Your message is back in the box below so you can send it
        again.
      </p>
    </div>
  );
}
