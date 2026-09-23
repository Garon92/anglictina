import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="page-container py-12 text-center">
      <div className="mb-3 text-5xl" aria-hidden="true">🧭</div>
      <h1 className="page-title">Tahle stránka neexistuje</h1>
      <p className="page-subtitle">Možná se změnila adresa. Zkus to z přehledu.</p>
      <div className="flex justify-center gap-3">
        <Link to="/" className="btn-primary">Dnešní plán</Link>
        <Link to="/practice" className="btn-secondary">Procvičování</Link>
      </div>
    </div>
  );
}
