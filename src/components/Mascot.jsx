export default function Mascot({ className = '', style = {}, alt = 'Trace, the Waypoint mascot' }) {
  return (
    <img
      src="/trace-mascot.png"
      alt={alt}
      className={`trace-mascot ${className}`}
      style={style}
      draggable={false}
    />
  );
}
