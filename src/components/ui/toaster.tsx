
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isError = variant === 'destructive'
        
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && (
                <ToastTitle className={isError ? "text-destructive font-semibold" : ""}>
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className={isError ? "text-destructive-foreground text-sm leading-relaxed" : ""}>
                  {description}
                </ToastDescription>
              )}
              {isError && !description && !title && (
                <ToastDescription className="text-destructive-foreground">
                  An error occurred. Please try again or contact support if the problem persists.
                </ToastDescription>
              )}
            </div>
            {action}
            {/* Only show close button for error toasts, regular toasts auto-dismiss */}
            {isError && <ToastClose />}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
