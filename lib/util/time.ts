export function convertTimeToSecond(durationStr: string): number {
  let result = durationStr.match(/(\d{2}):(\d{2}):(\d{2})\.?(\d{3})?/);
  if (
    !result ||
    result.length < 4 ||
    isNaN(parseInt(result[1])) ||
    isNaN(parseInt(result[2])) ||
    isNaN(parseInt(result[3]))
  ) {
    throw new Error("convertdurationToSecond error: " + durationStr);
  }

  if (result.length == 5 && !isNaN(parseInt(result[4]))) {
    return (
      parseInt(result[1]) * 60 * 60 +
      parseInt(result[2]) * 60 +
      parseFloat(result[3] + "." + result[4])
    );
  }

  return (
    parseInt(result[1]) * 60 * 60 +
    parseInt(result[2]) * 60 +
    parseFloat(result[3])
  );
}
