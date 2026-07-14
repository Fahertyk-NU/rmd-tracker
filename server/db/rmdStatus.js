function computeRmdStatus(record) {
  const {
    rmdAmount,
    amountTakenOrProjected,
    autoDistribution,
    fixedAmount,
    fixedSchedule,
  } = record;

  // pending -- rmd amount hasn't been entered yet
  if (!rmdAmount || rmdAmount === 0) {
    return "pending";
  }

  // fulfilled -- a real amount has been manually confirmed as taken
  if (amountTakenOrProjected >= rmdAmount && amountTakenOrProjected > 0) {
    return "fulfilled";
  }

  // on-track -- full recalculated auto dist covers it automatically
  if (autoDistribution === "full-recalculated") {
    return "on-track";
  }

  // on-track -- fixed distributions projected to cover the full rmd
  if (autoDistribution === "fixed" && fixedAmount) {
    const annualProjected =
      fixedSchedule === "monthly" ? fixedAmount * 12 : fixedAmount;
    if (annualProjected >= rmdAmount) {
      return "on-track";
    }
  }

  // action-required -- everything else
  return "action-required";
}

module.exports = { computeRmdStatus };
