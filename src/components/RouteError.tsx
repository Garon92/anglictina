import { isRouteErrorResponse, useRouteError, Link } from 'react-router';

/** Error screen for route-level failures (e.g. a lazy chunk failed to load after an update). */
export default function RouteError() {
  const error = useRouteError();
  const chunkFailed = error instanceof Error && /dynamically imported module|Failed to fetch|Importing a module script failed/i.test(error.message);
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Neočekávaná chyba';
  return (
    <div className="g92-app">
      <div className="m-auto max-w-md p-6 text-center">
        <div className="mb-3 text-5xl" aria-hidden="true">{chunkFailed ? '🔄' : '😵'}</div>
        <h1 className="mb-2 text-xl font-black text-fg">
          {chunkFailed ? 'Aplikace se aktualizovala' : 'Jejda, něco se pokazilo'}
        </h1>
        <p className="mb-4 text-sm text-muted">
          {chunkFailed
            ? 'Stránku je potřeba znovu načíst, aby se stáhla nová verze.'
            : 'Tvůj pokrok je v bezpečí. Zkus stránku obnovit nebo se vrátit na začátek.'}
        </p>
        {!chunkFailed && <p className="mb-5 rounded-lg bg-surface-2 p-2 font-mono text-xs break-all text-muted">{message}</p>}
        <div className="flex justify-center gap-3">
          <Link to="/" className="btn-secondary" reloadDocument>Na začátek</Link>
          <button type="button" className="btn-primary" onClick={() => location.reload()}>Obnovit</button>
        </div>
      </div>
    </div>
  );
}
