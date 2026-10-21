import { useState } from 'react'
import './App.css'
import LoanForm from './components/LoanForm'
import ResultCard from './components/ResultCard'
import Recommendations from './components/Recommendations'
import { getDecision } from './utils/calculator'
import { getRecommendations } from './utils/recommendations'
import IncomeBreakdown from './components/IncomeBreakdown'

function App() {
  const [result, setResult] = useState(null)
  const [calcError, setCalcError] = useState('')

  function handleSubmit(values) {
    try {
      const outcome = getDecision({
        grossIncome: values.income,
        monthlyExpenses: values.expenses,
        loanAmount: values.loanAmount,
        termYears: values.termYears,
      })

      const recommendations =
        outcome.decision === 'approved'
          ? null
          : getRecommendations({
              grossIncome: values.income,
              monthlyExpenses: values.expenses,
              loanAmount: values.loanAmount,
              termYears: values.termYears,
            })

      setResult({ inputs: values, outcome, recommendations })
      setCalcError('')
    } catch (err) {
      console.error(err)
      setResult(null)
      setCalcError('Something went wrong with the calculation. Please check your numbers.')
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Loan Eligibility Simulator</h1>
        <p>Check what you could afford before you apply.</p>
      </header>

      <main className="main">
        <section className="card">
          <h2>Your details</h2>
          <LoanForm onSubmit={handleSubmit} />
        </section>

        <section className="card">
          <h2>Your results</h2>

          {calcError && <p className="error">{calcError}</p>}

          {!result && !calcError && (
            <p>Fill in your details and press "Check eligibility".</p>
          )}

          {result && (
  <>
    <ResultCard
      status={result.outcome.decision}
      monthlyRepayment={result.outcome.repayment.monthlyPayment}
      loanAmount={result.inputs.loanAmount}
      termYears={result.inputs.termYears}
      annualRate={result.outcome.rate}
      leftoverAfter={result.outcome.affordability.remainingAfterRepayment}
      reasons={result.outcome.reasons}
    />

    <IncomeBreakdown
      grossIncome={result.inputs.income}
      monthlyExpenses={result.inputs.expenses}
      monthlyRepayment={result.outcome.repayment.monthlyPayment}
      affordability={result.outcome.affordability}
    />

    {result.recommendations && (
      <Recommendations
        decision={result.outcome.decision}
        options={result.recommendations.options}
        noDisposable={result.recommendations.noDisposable}
        original={result.inputs}
      />
    )}
  </>
)}
        </section>
      </main>

      <footer className="footer">
        <p>For illustration only. Not financial advice.</p>
      </footer>
    </div>
  )
}

export default App