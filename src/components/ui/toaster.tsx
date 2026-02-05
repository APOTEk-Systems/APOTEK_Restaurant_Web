import { useToast } from '@/hooks/use-toast';
import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastTitle,
	ToastProvider,
	ToastViewport,
} from '@/components/ui/toast';

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(function ({
				id,
				title,
				description,
				action,
				variant,
				...props
			}) {
				// Set duration based on variant - success toasts stay longer for user to read
				const duration = variant === 'success' ? 8000 : 5000;
				return (
					<Toast
						key={id}
						duration={duration}
						{...props}>
						<div className='grid gap-1'>
							{title && <ToastTitle>{title}</ToastTitle>}
							{description && (
								<ToastDescription>{description}</ToastDescription>
							)}
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}
