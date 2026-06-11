export const formatApproxMinutes = (minutes: number) => {
  const roundedMinutes = Math.max(0, Math.round(minutes));

  return `약 ${roundedMinutes}분`;
};
