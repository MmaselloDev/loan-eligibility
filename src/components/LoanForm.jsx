import { useState } from 'react'
import { LIMITS } from '../utils/calculator'

const emptyValues = {
  income: '',
  expenses: '',
  loanAmount: '',
  termYears: '',
}

function validate(values) {
  const errors = {}

  const check = (name, label, { min, max } = {}) => {
    const raw = values[name].trim()
    if (raw === '') {
      errors[name] = `${label} is required.`
      return
    }
    const num = Number(raw)
    if (Number.isNaN(num)) {
      errors[name] = `${label} must be a number.`
    } else if (min !== undefined && num < min) {
      errors[name] = `${label} must be at least ${min}.`
    } else if (max !== undefined && num > max) {
      errors[name] = `${label} must be at most ${max}.`
    }
  }

  check('income', 'Monthly income', { min: 1 })
  check('expenses', 'Monthly expenses', { min: 0 })
  check('loanAmount', 'Loan amount', { min: LIMITS.MIN_LOAN, max: LIMITS.MAX_LOAN })
  check('termYears', 'Term (years)', { min: LIMITS.MIN_TERM_YEARS, max: LIMITS.MAX_TERM_YEARS })

  if (!errors.income && !errors.expenses) {
    if (Number(values.expenses) > Number(values.income)) {
      errors.expenses = 'Expenses cannot be higher than income.'
    }
  }

  return errors
}

function Field({ label, name, value, error, onChange, hint }) {
  const errorId = `${name}-error`
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
      />
      {hint && !error && <span className="hint">{hint}</span>}
      {error && (
        <span id={errorId} className="error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

function LoanForm({ onSubmit }) {
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }

  function handleSubmit(e) {
    console.log('submit clicked')
    e.preventDefault()
    const newErrors = validate(values)
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        income: Number(values.income),
        expenses: Number(values.expenses),
        loanAmount: Number(values.loanAmount),
        termYears: Number(values.termYears),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Field
        label="Monthly income (R)"
        name="income"
        value={values.income}
        error={errors.income}
        onChange={handleChange}
      />
      <Field
        label="Monthly expenses (R)"
        name="expenses"
        value={values.expenses}
        error={errors.expenses}
        onChange={handleChange}
      />
      <Field
        label="Loan amount (R)"
        name="loanAmount"
        value={values.loanAmount}
        error={errors.loanAmount}
        onChange={handleChange}
      />
      <Field
        label="Term (years)"
        name="termYears"
        value={values.termYears}
        error={errors.termYears}
        onChange={handleChange}
        hint={`Between ${LIMITS.MIN_TERM_YEARS} and ${LIMITS.MAX_TERM_YEARS} years`}
      />
      <button type="submit" className="button">
        Check eligibility
      </button>
    </form>
  )
}

export default LoanForm