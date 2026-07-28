// Define the types for the toast
interface AddToastProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export const addToast = (message: string, type: 'info' | 'success' | 'warning' | 'error', duration?: number): void => {
  const event = new CustomEvent<AddToastProps>('add-toast', {
    detail: { message, type, duration },
  })
  window.dispatchEvent(event)
}

/** Dismisses all active toasts (e.g. after recovery from transient auth/network errors). */
export const clearToasts = (): void => {
  window.dispatchEvent(new CustomEvent('clear-toasts'))
}