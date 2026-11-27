import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { inputBase, inputBorder } from '@/components/forms/fieldStyles';

interface DescribedProps {
  hint?: string;
  error?: string;
}

function describedBy(id: string, { hint, error }: DescribedProps): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

function FieldLabel({
  id,
  label,
  required,
}: {
  id: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="block text-[15px] font-semibold leading-snug text-ink">
      {label}
      {required && (
        <span className="ml-1 text-danger" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

function Hint({ id, hint }: { id: string; hint?: string }) {
  if (!hint) return null;
  return (
    <p id={`${id}-hint`} className="mt-1 text-sm leading-relaxed text-ink-soft">
      {hint}
    </p>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} role="alert" className="shake mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
      <AlertCircle size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>{error}</span>
    </p>
  );
}

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name'>,
    DescribedProps {
  id: string;
  label: string;
  required?: boolean;
  registration: UseFormRegisterReturn;
  wrapperClassName?: string;
}

export function TextField({
  id,
  label,
  required,
  hint,
  error,
  registration,
  wrapperClassName,
  className,
  ...inputProps
}: TextFieldProps) {
  return (
    <div className={wrapperClassName}>
      <FieldLabel id={id} label={label} required={required} />
      <Hint id={id} hint={hint} />
      <input
        id={id}
        {...inputProps}
        {...registration}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint, error })}
        className={cn(inputBase, inputBorder(Boolean(error)), 'mt-2', className)}
      />
      <ErrorText id={id} error={error} />
    </div>
  );
}

interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'name'>,
    DescribedProps {
  id: string;
  label: string;
  required?: boolean;
  registration: UseFormRegisterReturn;
  wrapperClassName?: string;
  counter?: string;
}

export function TextAreaField({
  id,
  label,
  required,
  hint,
  error,
  registration,
  wrapperClassName,
  className,
  counter,
  ...inputProps
}: TextAreaFieldProps) {
  return (
    <div className={wrapperClassName}>
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel id={id} label={label} required={required} />
        {counter && <span className="text-xs tabular-nums text-ink-soft">{counter}</span>}
      </div>
      <Hint id={id} hint={hint} />
      <textarea
        id={id}
        {...inputProps}
        {...registration}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint, error })}
        className={cn(inputBase, inputBorder(Boolean(error)), 'mt-2 min-h-[140px] resize-y', className)}
      />
      <ErrorText id={id} error={error} />
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name'>,
    DescribedProps {
  id: string;
  label: string;
  required?: boolean;
  registration: UseFormRegisterReturn;
  options: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
}

export function SelectField({
  id,
  label,
  required,
  hint,
  error,
  registration,
  options,
  placeholder,
  wrapperClassName,
  className,
  ...inputProps
}: SelectFieldProps) {
  return (
    <div className={wrapperClassName}>
      <FieldLabel id={id} label={label} required={required} />
      <Hint id={id} hint={hint} />
      <select
        id={id}
        {...inputProps}
        {...registration}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { hint, error })}
        className={cn(inputBase, inputBorder(Boolean(error)), 'mt-2 appearance-none pr-10', className)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ErrorText id={id} error={error} />
    </div>
  );
}

interface CheckboxFieldProps extends DescribedProps {
  id: string;
  registration: UseFormRegisterReturn;
  children: ReactNode;
  className?: string;
  required?: boolean;
}

export function CheckboxField({
  id,
  registration,
  hint,
  error,
  children,
  className,
  required,
}: CheckboxFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="flex min-h-[44px] cursor-pointer items-start gap-3 py-1.5 text-[15px] leading-relaxed text-ink"
      >
        <input
          id={id}
          type="checkbox"
          {...registration}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { hint, error })}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-cream-300 accent-rapid-700 transition-transform duration-200 checked:scale-110"
        />
        <span>
          {children}
          {required && (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          )}
          {hint && (
            <span id={`${id}-hint`} className="mt-1 block text-sm text-ink-soft">
              {hint}
            </span>
          )}
        </span>
      </label>
      <ErrorText id={id} error={error} />
    </div>
  );
}

interface OptionGroupProps extends DescribedProps {
  name: string;
  legend: string;
  required?: boolean;
  options: { code: string; label: string; hint?: string }[];
  registration: UseFormRegisterReturn;
  type?: 'checkbox' | 'radio';
  columns?: 1 | 2;
  disabledCodes?: string[];
  className?: string;
}

export function OptionGroup({
  name,
  legend,
  required,
  hint,
  error,
  options,
  registration,
  type = 'checkbox',
  columns = 2,
  disabledCodes = [],
  className,
}: OptionGroupProps) {
  const groupId = `${name}-group`;
  return (
    <fieldset
      className={className}
      aria-describedby={describedBy(groupId, { hint, error })}
    >
      <legend className="text-[15px] font-semibold leading-snug text-ink">
        {legend}
        {required && (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </legend>
      <Hint id={groupId} hint={hint} />
      <div
        className={cn(
          'mt-3 grid gap-2',
          columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
        )}
      >
        {options.map((option) => {
          const optionId = `${name}-${option.code}`;
          return (
            <label
              key={option.code}
              htmlFor={optionId}
              className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-[15px] leading-snug text-ink transition-all duration-200 hover:-translate-y-px hover:border-rapid-600 hover:bg-cream-50 has-[:checked]:border-rapid-600 has-[:checked]:bg-rapid-50 has-[:checked]:shadow-[inset_0_0_0_1px_#0A6A4C]"
            >
              <input
                id={optionId}
                type={type}
                value={option.code}
                {...registration}
                disabled={disabledCodes.includes(option.code)}
                className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-rapid-700 transition-transform duration-200 checked:scale-110 disabled:opacity-40"
              />
              <span>
                {option.label}
                {option.hint && (
                  <span className="mt-0.5 block text-xs text-ink-soft">{option.hint}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      <ErrorText id={groupId} error={error} />
    </fieldset>
  );
}
