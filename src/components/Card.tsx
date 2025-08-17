interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-lg shadow-medium border border-neutral-200 dark:border-neutral-700 ${className}`}>
      {title && (
        <div className="border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}