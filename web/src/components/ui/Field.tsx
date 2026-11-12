import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FieldWrapperProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

function FieldWrapper({ id, label, error, hint, children }: FieldWrapperProps) {
  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="field__hint">{hint}</p>
      )}
    </div>
  );
}

/** Shared aria wiring so every control announces its error message. */
const a11y = (id: string, error?: string) => ({
  id,
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-error` : undefined,
});

type Common = { label: string; error?: string; hint?: string };

export function TextField({ label, error, hint, id, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper id={fieldId} label={label} error={error} hint={hint}>
      <input className="field__control" {...a11y(fieldId, error)} {...rest} />
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  error,
  hint,
  id,
  children,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper id={fieldId} label={label} error={error} hint={hint}>
      <select className="field__control" {...a11y(fieldId, error)} {...rest}>
        {children}
      </select>
    </FieldWrapper>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  id,
  ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper id={fieldId} label={label} error={error} hint={hint}>
      <textarea className="field__control" rows={3} {...a11y(fieldId, error)} {...rest} />
    </FieldWrapper>
  );
}
