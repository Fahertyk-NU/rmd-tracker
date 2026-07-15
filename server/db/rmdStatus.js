function computeRmdStatus(record) {
  const {
    rmdAmount,
    amountTakenOrProjected,
    autoDistribution,
    fixedAmount,
    fixedSchedule,
  } = record;

  // fulfilled -- amount taken exceeds rmd amount
  if (
    amountTakenOrProjected > 0 &&
    rmdAmount > 0 &&
    amountTakenOrProjected >= rmdAmount
  ) {
    return "fulfilled";
  }

  // on-track -- full recalculated auto dist set up
  if (autoDistribution === "full-recalculated") {
    return "on-track";
  }

  // on-track -- fixed distributions projected to cover the full rmd
  if (autoDistribution === "fixed" && fixedAmount && rmdAmount > 0) {
    const annualProjected =
      fixedSchedule === "monthly" ? fixedAmount * 12 : fixedAmount;
    if (annualProjected >= rmdAmount) {
      return "on-track";
    }
  }

  // action-required -- fixed dist won't cover rmd
  if (autoDistribution === "fixed" && rmdAmount > 0) {
    return "action-required";
  }

  // action-required -- no auto dist and amount taken is less than rmd
  if (autoDistribution === "none" && rmdAmount > 0) {
    return "action-required";
  }

  // pending -- no rmd amount entered and no auto dist
  return "pending";
}

module.exports = { computeRmdStatus };
