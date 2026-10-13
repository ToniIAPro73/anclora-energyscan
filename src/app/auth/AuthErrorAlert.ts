import { createElement } from 'react';

export function AuthErrorAlert({ message }: { message: string }) {
  return createElement(
    'div',
    { className: 'mb-3 rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-sm leading-relaxed text-[#EF4444]', role: 'alert' },
    message,
  );
}
