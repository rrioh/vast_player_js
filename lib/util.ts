export function convertTimeToSecond(durationStr: string) {
    let result = durationStr.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!result || result.length < 4 || parseInt(result[1]) === NaN || parseInt(result[2]) === NaN || parseInt(result[3]) === NaN) {
        throw new Error("convertdurationToSecond error: " + durationStr);
    }

    return parseInt(result[1]) * 60 * 60 + parseInt(result[2]) * 60 + parseInt(result[3]);
}
