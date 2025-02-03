type MessageDisplayProps = {
  label: string;
  message: unknown;
};

export default function MessageDisplay({ label, message }: MessageDisplayProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm font-medium text-gray-500 mb-2">
        {label}
        :
      </p>
      <pre className="text-sm overflow-auto">
        {JSON.stringify(message, null, 2)}
      </pre>
    </div>
  );
}
