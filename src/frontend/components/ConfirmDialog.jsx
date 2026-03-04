const ConfirmDialog = ({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] animate-fade-in px-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm animate-modal-in shadow-2xl">
      <div className="flex items-start gap-4 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-expense/15' : 'bg-accent/15'}`}>
          <svg className={`w-5 h-5 ${danger ? 'text-expense' : 'text-accent'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-text-primary font-semibold text-base mb-1">{title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="btn-ghost">Cancel</button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${danger ? 'bg-expense text-white hover:bg-red-600' : 'bg-accent text-bg hover:bg-accent-dark'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;