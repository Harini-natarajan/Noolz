import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';

export default function NotFound() {
  return (
    <div className="container-page py-24">
      <EmptyState
        title="Page not found"
        message="The page you're looking for has slipped through the seams."
        action={<Link to="/" className="btn-primary">Back to Home</Link>}
      />
    </div>
  );
}
