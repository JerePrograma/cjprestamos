import { useState } from 'react';
import { useAuth } from '../../app/auth';
import { leerSesionOperadora } from '../../services/sesionOperadora';

export function LoginPage() {
  const { iniciarSesion } = useAuth();
  const [usuario, setUsuario] = useState(() => leerSesionOperadora()?.usuario ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      await iniciarSesion({ usuario: usuario.trim(), password });
      setPassword('');
    } catch {
      setError('No se pudo iniciar sesión. Verificá usuario y contraseña.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[1fr_420px]">
        <section className="panel hidden p-8 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">cjprestamos</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">Libreta operativa clara para préstamos manuales.</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Diseño sobrio, datos legibles y flujo rápido para operar personas, préstamos, cuotas y pagos sin perder control.
          </p>
        </section>

        <form onSubmit={onSubmit} className="panel w-full p-7 sm:p-8">
          <h2 className="titulo-seccion">Acceso de operadora</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Ingresá tus credenciales para usar el sistema interno.</p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="label-ui mb-1 block">Usuario</span>
              <input value={usuario} onChange={(event) => setUsuario(event.target.value)} autoComplete="username" required className="w-full" />
            </label>

            <label className="block text-sm">
              <span className="label-ui mb-1 block">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="w-full"
              />
            </label>
          </div>

          {error && <p className="mensaje-error mt-3">{error}</p>}

          <button type="submit" disabled={enviando} className="boton-principal mt-6 w-full">
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
