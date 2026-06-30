import { useParams } from 'react-router-dom';

export default function ChildDetailPage() {
  const { id } = useParams();
  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: '#111' }}>Detail dítěte</h1>
      <p style={{ color: '#888', fontSize: '14px' }}>ID: {id} — stub (připraveno pro V8 implementaci)</p>
    </div>
  );
}
