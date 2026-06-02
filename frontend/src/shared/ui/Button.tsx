import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'principal' | 'secundario' | 'fantasma' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: ButtonVariant;
};

type ButtonLinkProps = {
  to: string;
  children: ReactNode;
  variante?: ButtonVariant;
  className?: string;
};

const clasesPorVariante: Record<ButtonVariant, string> = {
  principal: 'boton-principal',
  secundario: 'boton-secundario',
  fantasma: 'boton-fantasma',
  danger: 'boton-danger',
};

function armarClases(variante: ButtonVariant, className?: string) {
  return [clasesPorVariante[variante], className].filter(Boolean).join(' ');
}

export function Button({
  variante = 'secundario',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={armarClases(variante, className)}
      {...props}
    />
  );
}

export function ButtonLink({
  to,
  children,
  variante = 'secundario',
  className,
}: ButtonLinkProps) {
  return (
    <Link to={to} className={armarClases(variante, className)}>
      {children}
    </Link>
  );
}
