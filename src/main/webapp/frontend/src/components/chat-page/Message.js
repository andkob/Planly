export default function Message({ message }) {
  return (
    <div className={`flex ${message.own ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xl rounded-lg p-3 ${message.own
            ? 'bg-indigo-600 text-white'
            : 'bg-white border'
          }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-medium ${message.own ? 'text-white' : 'text-gray-900'}`}>
            {message.senderUsername}
          </span>
          <span className={`text-xs ${message.own ? 'text-indigo-200' : 'text-gray-500'}`}>
            {new Date(message.sentAt).toLocaleTimeString()}
          </span>
          {message.isEdited && (
            <span className={`text-xs ${message.own ? 'text-indigo-200' : 'text-gray-500'}`}>
              (edited)
            </span>
          )}
        </div>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
};