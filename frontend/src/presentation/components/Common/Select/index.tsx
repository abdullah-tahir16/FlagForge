import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label: string;
  options: SelectOption[];
}

const Select = ({ error, id, label, options, ...props }: Props) => {
  const selectId = id ?? props.name;
  const errorId = `${selectId}-error`;

  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-app-text" htmlFor={selectId}>
      {label}
      <select
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="min-h-11 rounded-app border border-app-border bg-app-surface px-3.5 py-2 text-base text-app-text outline-none transition duration-app hover:border-app-primary/50 focus:border-app-primary focus:ring-2 focus:ring-app-focus/70"
        id={selectId}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-sm font-normal text-app-danger" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
};

export default Select;
