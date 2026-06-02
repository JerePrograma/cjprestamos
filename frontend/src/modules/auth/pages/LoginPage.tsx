import { useState, type FormEvent } from 'react';
import { useAuth } from '../../../app/auth';
import { leerSesionOperadora } from '../../../shared/lib/sesionOperadora';

export function LoginPage() {
  const { iniciarSesion } = useAuth();

  const [usuario, setUsuario] = useState(
    () => leerSesionOperadora()?.usuario ?? '',
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[1fr_420px]">
        <section className="panel-accent hidden p-8 lg:block">
          <p className="label-ui">
            cjprestamos
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-app">
            Libreta operativa clara para préstamos manuales.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-soft">
            Diseño sobrio, datos legibles y flujo rápido para operar personas,
            préstamos, cuotas y pagos sin perder control.
          </p>

          <div className="mt-6 grid gap-3">
            <div className="surface-inset">
              <p className="text-sm font-semibold text-app">
                Control operativo
              </p>
              <p className="mt-1 text-sm text-muted">
                Personas, préstamos, caja y legajos desde un mismo sistema.
              </p>
            </div>

            <div className="surface-inset">
              <p className="text-sm font-semibold text-app">
                Lectura rápida
              </p>
              <p className="mt-1 text-sm text-muted">
                Prioridad visual para montos, estados y acciones frecuentes.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={onSubmit} className="panel-elevado w-full p-7 sm:p-8">
          <h2 className="titulo-seccion">
            Acceso de operadora
          </h2>

          <p className="mt-1 text-sm text-soft">
            Ingresá tus credenciales para usar el sistema interno.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="label-ui mb-1 block">
                Usuario
              </span>

              <input
                value={usuario}
                onChange={(event) => setUsuario(event.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label className="block text-sm">
              <span className="label-ui mb-1 block">
                Contraseña
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          {error && (
            <p className="mensaje-error mt-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="boton-principal mt-6 w-full"
          >
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  );
}
