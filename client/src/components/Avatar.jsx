function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

function getColor(name = '') {
  const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500'];
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
}

export default function Avatar({ firstName = '', lastName = '', size = 10 }) {
  const initials = getInitials(firstName, lastName);
  const fullName = `${firstName} ${lastName}`.trim();
  const color = getColor(fullName || initials);

  return (
    <div
      className={`${color} text-white font-bold rounded-full flex items-center justify-center`}
      style={{ width: `${size * 4}px`, height: `${size * 4}px`, fontSize: `${size * 1.2}px` }}
      title={fullName}
    >
      {initials || '?'}
    </div>
  );
}
