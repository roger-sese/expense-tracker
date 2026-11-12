'use client';

import { useState, type FormEvent } from 'react';
import { Button, TextField } from '@/components/ui';

export const PALETTE = ['#f97316', '#3b82f6', '#ef4444', '#a855f7', '#22c55e', '#eab308', '#0ea5e9', '#64748b'];

export interface CategoryFormValues {
  name: string;
  color: string;
}

interface CategoryFormProps {
  initialValues?: CategoryFormValues;
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => Promise<unknown>;
  onCancel?: () => void;
}

/** Used both for adding a new category and editing one inline. */
export function CategoryForm({ initialValues, submitLabel, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [color, setColor] = useState(initialValues?.color ?? PALETTE[0]);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      await onSubmit({ name: name.trim(), color });
      if (!initialValues) setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save category');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="category-form" onSubmit={handleSubmit} noValidate>
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} error={error} maxLength={40} />
      <fieldset className="swatches">
        <legend className="field__label">Colour</legend>
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch${c === color ? ' swatch--active' : ''}`}
            style={{ backgroundColor: c }}
            aria-label={`Colour ${c}`}
            aria-pressed={c === color}
            onClick={() => setColor(c)}
          />
        ))}
      </fieldset>
      <div className="form__actions">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
