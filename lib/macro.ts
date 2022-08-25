export enum ErrorCode {
    XMLParseError = 100,
    VASTSchemaValidationError,
    VASTVersionOfResponseNotSupported,

    NonPlayableAdType = 200,
    MediaPlayerExpectingDifferentLinearity,
    MediaPlayerExpectingDifferentDuration,
    MediaPlayerExpectingDifferentSize,
    AdCategoryNotProvided,
    InlineCategoryViolatesWrapperBlockedAdCategories,
    AdNotServed,

    GeneralWrapperError = 300,
    VASTURIUnavailableOrTimeout,
    WrapperLimitReached,
    NoVASTResponseAfterWrapper,
    AdUnitNotDisplayed,

    GeneralLinearError = 400,
    FileNotFound,
    MediaFileURITimeout,
    SupportedMediaFileNotFound,
    ProblemDisplayingMediaFile = 405,
    MezzanineNotProvided,
    MezzanineDownloading,
    ConditionalAdRejected,
    InteractiveUnitNotExecuted,
    VerificationUnitNotExecuted,
    NotRequiredSpecificationOfMezzanine,

    GeneralNonLinearAdsError = 500,
    NonLinearAdNonDisplayable,
    UnableToFetchNonLinearResource,
    SupportedNonLinearResourceNotFound,

    GeneralCompanionAdsError = 600,
    CompanionNonDisplayableByDimemsionError,
    RequiredCompanionNonDisplayable,
    UnableToFetchNonCompanionResource,
    SupportedCompanionResourceNotFound,

    UndefinedError = 900,
    GeneralVPAIDError,
    GeneralInteractiveCreativeFileError
}

export type MacroReplacer = (target: string, errorCode: ErrorCode | null) => void;

export function createReplacer(videoParent: HTMLElement): MacroReplacer {
    let replaceMap = new Map<string, string | (() => string)>();
    let date = new Date();
    replaceMap.set('[TIMESTAMP]', date.toISOString());

    // inview ratio
    const inviewRatioMgr: {
        ratio: number;
    } = {
        ratio: 0
    };
    const options = {
        rootMargin: "0px",
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    }
    function callback(entries: IntersectionObserverEntry[]) {
        entries.forEach(function(entry) {
            const ratio = Math.floor(entry.intersectionRatio * 100) / 100;
            inviewRatioMgr.ratio = ratio;
        });
    }
    const observer = new IntersectionObserver(callback, options);
    observer.observe(videoParent);
    replaceMap.set('[INVIEW_RATIO]', getInviewRatio(inviewRatioMgr));

    return (target: string, errorCode: ErrorCode | null) => {
        if (errorCode) {
            replaceMap.set("[ERRORCODE]", errorCode.toString())
        }
        replaceMap.forEach((value, key) => {
            target = target.replace(key, typeof value === "function" ? value() : value);
        });
    };
}

function getInviewRatio(inviewRatioMgr: {ratio: number}): () => string {
    return () => {
        return inviewRatioMgr.ratio.toFixed(2);
    };
}