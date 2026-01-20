function Notice({ notice }) {
  if (!notice) return null;
  return (
    <div className={`notice notice--${notice.type || 'info'}`}>
      {notice.text}
    </div>
  );
}

export default Notice;




