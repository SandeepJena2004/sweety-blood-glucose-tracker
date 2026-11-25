export default function EmptyState({ message, icon = '📋' }) {
  return (
    <div className="text-center py-12">
      <span className="text-4xl">{icon}</span>
      <p className="mt-3 text-gray-500">{message}</p>
    </div>
  );
}
