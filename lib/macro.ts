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
