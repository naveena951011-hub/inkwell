export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast${toast.type === 'error' ? ' error' : ''}`}>
      {toast.msg}
    </div>
  );
}
