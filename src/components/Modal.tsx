interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-neutral-800 rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden mx-4 sm:mx-0`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 pr-4">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}