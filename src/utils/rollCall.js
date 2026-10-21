// Prefer the API's value, otherwise derive it from the vote counts
export function getMissedPercentage(rollCall) {
  if (!rollCall) return null;
  if (rollCall.missedPercentage != null) return Number(rollCall.missedPercentage);
  if (rollCall.totalVotes > 0 && rollCall.missedVotes != null) {
    return (rollCall.missedVotes / rollCall.totalVotes) * 100;
  }
  if (rollCall.attendancePercentage != null) return 100 - Number(rollCall.attendancePercentage);
  return null;
}
