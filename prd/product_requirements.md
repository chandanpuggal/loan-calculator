# Product Requirement Document (PRD)

**Product Name:** Loan Repayment vs. SIP Investment Decision Engine  
**Document Status:** Draft  
**Target Market:** India (Primary) & Region-Agnostic Core  
**Owner:** Product Management  

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Retail borrowers in India holding high-value, long-tenure loans (e.g., Home Loans at 8.5%–9.5% p.a.) frequently struggle with surplus capital allocation. When extra monthly cash flow or lump-sum funds become available, borrowers face a complex decision:
1. **Option A (Accelerate Debt Clearance):** Prepay the loan to save guaranteed, compounding interest costs.
2. **Option B (Invest in Equity SIPs):** Maintain minimum EMI payments and direct surplus cash into Equity Mutual Fund SIPs targeting market compounding (historically 12%–14% CAGR).

This decision cannot be resolved using simple interest comparisons. It requires evaluating dynamic variables:
* Tax shields on home loan interest under Section 24(b) (Old Tax Regime).
* Taxation of equity gains under Long-Term Capital Gains (LTCG) tax rules (12.5% tax on gains above ₹1.25 Lakh/year).
* The post-payoff compounding effect (redirecting full EMIs into investments once the debt is cleared early).

### 1.2 Product Vision
Build a standardized, open-source calculation engine that delivers clear, objective, and tax-adjusted net-wealth comparisons between debt prepayment and investment compounding over a matched time horizon.

---

## 2. User Personas & Core Use Cases

* **Persona 1: The Risk-Averse Homeowner**  
  * *Goal:* Eliminate long-term debt liabilities quickly to achieve financial peace of mind.  
  * *Need:* Understand how many years/months of EMI payments can be cut by making extra monthly payments, and how much interest is saved net of tax benefits lost.

* **Persona 2: The Wealth Maximizer**  
  * *Goal:* Maximize absolute net worth at the end of a 15–20 year time horizon.  
  * *Need:* Determine the exact breakeven Equity SIP return rate (CAGR %) required to outperform guaranteed loan interest savings after accounting for LTCG tax.

* **Persona 3: The FinTech Product/Engineering Lead**  
  * *Goal:* Integrate a "Loan Prepay vs. Invest" calculator into a banking, lending, or wealth management portal.  
  * *Need:* A well-defined calculation engine specification with deterministic financial logic, inputs, outputs, and edge-case handling.

---

## 3. Product Scope & Functional Requirements

```
                                  +---------------------------------------+
                                  |         User Inputs & Context         |
                                  | (Loan, Investment, Surplus, Tax Regime)|
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |         Calculation Engine            |
                                  +---------+-------------------+---------+
                                            |                   |
                    +-----------------------+                   +-----------------------+
                    |                                                                   |
                    v                                                                   v
+-------------------+-------------------+                               +---------------+-------------------+
|      Strategy A: Prepay Loan          |                               |       Strategy B: Invest Surplus      |
|  1. Apply monthly extra to Principal  |                               |  1. Pay regular EMI schedule      |
|  2. Calculate early payoff month      |                               |  2. Direct extra cash to SIP      |
|  3. Divert (EMI + Extra) to SIP       |                               |  3. Claim Sec 24(b) tax deductions|
|  4. Deduct LTCG tax at end            |                               |  4. Deduct LTCG tax at end        |
+-------------------+-------------------+                               +---------------+-------------------+
                    |                                                                   |
                    +-----------------------+                   +-----------------------+
                                            |                   |
                                            v                   v
                                  +---------+-------------------+---------+
                                  |        Comparative Analysis           |
                                  |  - Net Worth Delta                    |
                                  |  - Breakeven SIP CAGR                 |
                                  |  - Recommended Strategy Output        |
                                  +---------------------------------------+
```

### 3.1 Input Parameter Specifications

The engine must accept four distinct categories of input parameters:

| Category | Field Name | Validation Rules | Description |
| :--- | :--- | :--- | :--- |
| **Loan Details** | Outstanding Principal | $> 0$, Currency | Remaining principal balance owed to the lender. |
| | Annual Interest Rate (%) | $> 0\%$, Maximum $30\%$ | Nominal annual interest rate (floating/fixed). |
| | Remaining Tenure | $> 0$, Months or Years | Remaining duration of the original loan schedule. |
| **Surplus Capital** | Extra Monthly Cash Flow | $\ge 0$, Currency | Monthly surplus available for allocation. |
| | One-Time Lump Sum | $\ge 0$, Currency | Initial capital available at Month 0. |
| **Investment** | Expected Annual Return (%) | $\ge 0\%$, Maximum $30\%$ | Expected annual nominal CAGR for equity mutual funds. |
| **Tax Context** | Income Tax Regime | Enum (`OLD_REGIME`, `NEW_REGIME`) | Governs applicability of Section 24(b) deductions. |
| | Borrower Tax Slab (%) | $0\%, 5\%, 10\%, 15\%, 20\%, 30\%$ | Marginal tax rate used to evaluate annual tax savings. |

---

## 4. Business Logic, Financial Formulas & Clauses

To maintain strict comparability, **both strategies must be evaluated over the exact same total duration** (the original loan tenure).

### 4.1 Strategy A: Accelerated Loan Prepayment Logic

1. **Amortization Phase:**
   * In each month, calculate interest accrued on remaining principal.
   * Subtract regular EMI plus `Extra Monthly Cash Flow` from the balance.
   * Repeat until remaining principal reaches ₹0. Record the exact month of debt clearance (`Payoff_Month`).

2. **Diverted Compounding Phase:**
   * For all remaining months from (`Payoff_Month + 1`) to `Original_Tenure`:
   * The total monthly cash flow (`Regular_EMI + Extra_Monthly_Cash_Flow`) is invested into an Equity SIP at the expected annual return rate.

3. **Terminal Wealth & Tax Realization:**
   * At `Original_Tenure`, calculate total gains generated in the post-payoff SIP.
   * Apply Equity LTCG rules (Clause 4.3) to the accumulated gains to yield `Strategy_A_Net_Wealth`.

### 4.2 Strategy B: Invest Surplus via SIP Logic

1. **Parallel Execution:**
   * Pay the regular EMI on the loan for the full `Original_Tenure`.
   * Simultaneously invest `Extra Monthly Cash Flow` into an Equity SIP for the entire `Original_Tenure`.

2. **Annual Tax Shield Realization (Old Tax Regime):**
   * For each financial year, sum total home loan interest paid.
   * Apply Section 24(b) cap (Clause 4.4). Multiply eligible interest deduction by `Borrower_Tax_Slab` to determine annual tax savings.
   * Assume annual tax savings are accumulated to add to net value.

3. **Terminal Wealth Realization:**
   * At `Original_Tenure`, calculate total gains generated across the full SIP duration.
   * Apply Equity LTCG rules (Clause 4.3) to yield `Strategy_B_Net_Wealth`.

---

### 4.3 Clause: Indian Equity LTCG Tax Policy
* **Exemption Threshold:** The first **₹1,25,000** of cumulative long-term capital gains realized at maturity is **tax-exempt**.
* **Tax Rate:** Total gains exceeding ₹1,25,000 are taxed at a flat rate of **12.5%**.
* **Formula:**
  $$\text{Taxable Gain} = \max(0, \text{Total Portfolio Value} - \text{Total Capital Invested} - 125000)$$
  $$\text{LTCG Tax Payable} = \text{Taxable Gain} \times 0.125$$

---

### 4.4 Clause: Section 24(b) Home Loan Interest Deduction Policy
* **Applicability:** Applies **only** if `Income_Tax_Regime == OLD_REGIME`. Under `NEW_REGIME`, the deduction is ₹0.
* **Annual Deduction Cap:** Maximum **₹2,00,000** per financial year for self-occupied residential property.
* **Formula:**
  $$\text{Eligible Annual Interest} = \min(\text{Annual Interest Paid}, 200000)$$
  $$\text{Annual Tax Refund} = \text{Eligible Annual Interest} \times \text{Borrower\_Tax\_Slab}$$

---

## 5. Decision Outputs & KPI Definitions

The engine must produce a structured output object containing the following metrics:

1. **Strategy A Summary (Prepay):**
   * Total Interest Paid to Bank.
   * Payoff Duration (Months saved compared to original tenure).
   * Total Value of Post-Payoff Investment Portfolio.
   * Net Final Wealth (Post-LTCG Tax).

2. **Strategy B Summary (Invest):**
   * Total Interest Paid to Bank.
   * Total Tax Refund Earned via Section 24(b).
   * Gross Value of SIP Investment Portfolio.
   * Total LTCG Tax Liability.
   * Net Final Wealth (Post-LTCG Tax + Tax Refunds).

3. **Comparative Indicators:**
   * **Absolute Net Worth Delta:**
     $$\text{Net Worth Delta} = \text{Strategy B Net Wealth} - \text{Strategy A Net Wealth}$$
   * **Recommended Strategy:**
     * `PREPAY_LOAN` if Delta $< 0$.
     * `INVEST_SURPLUS` if Delta $> 0$.
     * `EQUIVALENT` if Delta $== 0$.
   * **Breakeven SIP Return (% CAGR):** The exact annual investment return rate at which Strategy B Net Wealth equals Strategy A Net Wealth.

---

## 6. Business Logic Example (Step-by-Step Scenario)

### Scenario Setup
* **Loan Balance:** ₹50,00,000 (₹50 Lakhs)
* **Loan Interest Rate:** 9.0% p.a.
* **Remaining Tenure:** 20 Years (240 Months)
* **Standard Monthly EMI:** ₹44,986
* **Surplus Monthly Cash Flow:** ₹20,000
* **Expected Equity SIP Return:** 12.0% p.a.
* **Tax Context:** Old Tax Regime, 30% Tax Slab Rate.

---

### Strategy A Execution Flow (Prepay)
1. **Accelerated Payoff:**
   * Total monthly payment = ₹44,986 (EMI) + ₹20,000 (Surplus) = **₹64,986**.
   * Loan principal drops to zero at **Month 133** (~11 Years, 1 Month), saving **107 months** of debt payments.
   * Total loan interest paid: **₹26,43,138**.

2. **Post-Payoff SIP Phase:**
   * From Month 134 through Month 240 (107 months remaining), invest ₹64,986 monthly into Equity SIP at 12% p.a.
   * Gross Investment Portfolio at Month 240: **₹1,21,12,450**.
   * Total Capital Invested: ₹69,53,502.
   * Total Capital Gains: ₹51,58,948.

3. **Tax Deduction & Net Wealth:**
   * Taxable LTCG = ₹51,58,948 − ₹1,25,000 = ₹50,33,948.
   * LTCG Tax (12.5%) = **₹6,29,244**.
   * **Strategy A Final Net Wealth = ₹1,14,83,206**.

---

### Strategy B Execution Flow (Invest)
1. **Parallel Execution:**
   * Pay standard EMI of ₹44,986 for all 240 months. Total interest paid: **₹57,96,711**.
   * Invest surplus ₹20,000 monthly in Equity SIP at 12% p.a. for 240 months.
   * Gross Investment Portfolio at Month 240: **₹1,99,82,960**.
   * Total Capital Invested: ₹48,00,000.
   * Total Capital Gains: ₹1,51,82,960.

2. **Tax Shield Benefits (Sec 24b):**
   * Cumulative tax saved over 20 years across applicable annual caps at 30% slab rate: **₹15,20,000**.

3. **Tax Deduction & Net Wealth:**
   * Taxable LTCG = ₹1,51,82,960 − ₹1,25,000 = ₹1,50,57,960.
   * LTCG Tax (12.5%) = **₹18,82,245**.
   * Net SIP Value = ₹1,99,82,960 − ₹18,82,245 = ₹1,81,00,715.
   * Add Tax Saved = ₹1,81,00,715 + ₹15,20,000.
   * **Strategy B Final Net Wealth = ₹1,96,20,715**.

---

### Comparative Recommendation Output
* **Net Worth Delta:** ₹1,96,20,715 − ₹1,14,83,206 = **+₹81,37,509 in favor of Strategy B**.
* **Recommendation:** `INVEST_SURPLUS`
* **Insight:** Because the 12% expected SIP return comfortably exceeds the effective post-tax loan cost (~6.3% under 30% tax bracket), investing surplus yields significantly higher wealth over 20 years.

---

## 7. Edge Cases & Handling Rules

1. **Surplus Cash Flow Exceeds Loan Principal:**
   * *Rule:* If `Lump_Sum + Monthly_Extra` clears the loan in Month 1, the engine transitions immediately to 100% investment compounding mode for the full tenure.

2. **Expected Investment Return Equals Loan Rate:**
   * *Rule:* Due to the LTCG tax drag (12.5%), if `Expected_Return == Loan_Rate`, Prepayment (`Strategy A`) will almost always generate higher net wealth. The engine must explicitly surface this insight in user messaging.

3. **Zero Surplus Provided:**
   * *Rule:* If `Monthly_Extra == 0` and `Lump_Sum == 0`, Strategy A and Strategy B outputs become identical. The engine returns `Net Worth Delta = 0` and recommendation `EQUIVALENT`.

4. **New Tax Regime Selection:**
   * *Rule:* If `Tax_Regime == NEW_REGIME`, Section 24(b) tax savings must evaluate to ₹0 across all years, isolating the decision purely to interest cost vs. LTCG-adjusted investment return.
