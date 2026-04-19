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
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-8">
      <form onSubmit={onSubmit} className="panel w-full max-w-md p-6 sm:p-7">
        <h1 className="titulo-seccion">Acceso de operadora</h1>
        <p className="mt-1 text-sm text-slate-500">Ingresá tus credenciales para usar el sistema interno.</p>

        <div className="mt-5 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Usuario</span>
            <input
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={enviando} className="boton-principal mt-5 w-full">
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
