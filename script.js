function calculateComparison(loanAmount, interestRate, totalTenureYears, prepayAmount, prepayFrequency, expectedReturnRate) {
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = totalTenureYears * 12;
    const investmentMonthlyRate = expectedReturnRate / 12 / 100;

    // Baseline EMI
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                (Math.pow(1 + monthlyRate, totalMonths) - 1);

    // Scenario A: Prepaying Loan
    let balanceA = loanAmount;
    let totalInterestA = 0;
    let monthsSaved = 0;

    for (let month = 1; month <= totalMonths; month++) {
        const interest = balanceA * monthlyRate;
        let principalPaid = emi - interest;

        if (prepayFrequency === 'monthly') {
            principalPaid += prepayAmount;
        }

        if (balanceA - principalPaid <= 0) {
            totalInterestA += interest;
            monthsSaved = totalMonths - month;
            break;
        }

        balanceA -= principalPaid;
        totalInterestA += interest;
    }

    // Scenario B: Investing the Prepayment Amount in Mutual Funds
    let investmentFV = 0;
    if (prepayFrequency === 'monthly') {
        // Future Value of monthly SIP over the full loan tenure
        investmentFV = prepayAmount * ((Math.pow(1 + investmentMonthlyRate, totalMonths) - 1) / investmentMonthlyRate) * (1 + investmentMonthlyRate);
    } else {
        // Lumpsum investment over the full loan tenure
        investmentFV = prepayAmount * Math.pow(1 + expectedReturnRate / 100, totalTenureYears);
    }

    const baselineTotalInterest = (emi * totalMonths) - loanAmount;
    const interestSaved = baselineTotalInterest - totalInterestA;

    return {
        baselineEMI: emi.toFixed(2),
        interestSaved: interestSaved.toFixed(2),
        investmentWealthGained: (investmentFV - (prepayFrequency === 'monthly' ? prepayAmount * totalMonths : prepayAmount)).toFixed(2),
        totalInvestmentValue: investmentFV.toFixed(2),
        monthsSaved
    };
}
