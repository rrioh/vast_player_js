export function getMediaType(url: string): string {
    if (/\.mp4$/.test(url)) {
        return "video/mp4";
    } else if (/\.mov$/.test(url)) {
        return "video/quicktime";
    } else if (/\.mpg$/.test(url) || /\.mpeg$/.test(url)) {
        return "video/mpeg";
    } else if (/\.webm$/.test(url)) {
        return "video/webm";
    } else {
        return "";
    }
}