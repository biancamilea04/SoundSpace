use std::convert::TryFrom;
use std::fmt;


#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StatusCode {
    // 1xx Informational
    Continue,                       // 100
    SwitchingProtocols,             // 101
    Processing,                     // 102
    EarlyHints,                     // 103

    // 2xx Success
    Ok,                             // 200
    Created,                        // 201
    Accepted,                       // 202
    NonAuthoritativeInformation,    // 203
    NoContent,                      // 204
    ResetContent,                   // 205
    PartialContent,                 // 206
    MultiStatus,                    // 207
    AlreadyReported,                // 208
    ImUsed,                         // 226

    // 3xx Redirection
    MultipleChoices,                // 300
    MovedPermanently,               // 301
    Found,                          // 302
    SeeOther,                       // 303
    NotModified,                    // 304
    UseProxy,                       // 305
    TemporaryRedirect,              // 307
    PermanentRedirect,              // 308

    // 4xx Client Errors
    BadRequest,                     // 400
    Unauthorized,                   // 401
    PaymentRequired,                // 402
    Forbidden,                      // 403
    NotFound,                       // 404
    MethodNotAllowed,               // 405
    NotAcceptable,                  // 406
    ProxyAuthenticationRequired,    // 407
    RequestTimeout,                 // 408
    Conflict,                       // 409
    Gone,                           // 410
    LengthRequired,                 // 411
    PreconditionFailed,             // 412
    PayloadTooLarge,                // 413
    UriTooLong,                     // 414
    UnsupportedMediaType,           // 415
    RangeNotSatisfiable,            // 416
    ExpectationFailed,              // 417
    ImATeapot,                      // 418
    MisdirectedRequest,             // 421
    UnprocessableEntity,            // 422
    Locked,                         // 423
    FailedDependency,               // 424
    TooEarly,                       // 425
    UpgradeRequired,                // 426
    PreconditionRequired,           // 428
    TooManyRequests,                // 429
    RequestHeaderFieldsTooLarge,    // 431
    UnavailableForLegalReasons,     // 451

    // 5xx Server Errors
    InternalServerError,            // 500
    NotImplemented,                 // 501
    BadGateway,                     // 502
    ServiceUnavailable,             // 503
    GatewayTimeout,                 // 504
    HttpVersionNotSupported,        // 505
    VariantAlsoNegotiates,          // 506
    InsufficientStorage,            // 507
    LoopDetected,                   // 508
    NotExtended,                    // 510
    NetworkAuthenticationRequired,  // 511
}

impl From<StatusCode> for u16 {
    fn from(code: StatusCode) -> u16 {
        match code {
            // 1xx
            StatusCode::Continue => 100,
            StatusCode::SwitchingProtocols => 101,
            StatusCode::Processing => 102,
            StatusCode::EarlyHints => 103,

            // 2xx
            StatusCode::Ok => 200,
            StatusCode::Created => 201,
            StatusCode::Accepted => 202,
            StatusCode::NonAuthoritativeInformation => 203,
            StatusCode::NoContent => 204,
            StatusCode::ResetContent => 205,
            StatusCode::PartialContent => 206,
            StatusCode::MultiStatus => 207,
            StatusCode::AlreadyReported => 208,
            StatusCode::ImUsed => 226,

            // 3xx
            StatusCode::MultipleChoices => 300,
            StatusCode::MovedPermanently => 301,
            StatusCode::Found => 302,
            StatusCode::SeeOther => 303,
            StatusCode::NotModified => 304,
            StatusCode::UseProxy => 305,
            StatusCode::TemporaryRedirect => 307,
            StatusCode::PermanentRedirect => 308,

            // 4xx
            StatusCode::BadRequest => 400,
            StatusCode::Unauthorized => 401,
            StatusCode::PaymentRequired => 402,
            StatusCode::Forbidden => 403,
            StatusCode::NotFound => 404,
            StatusCode::MethodNotAllowed => 405,
            StatusCode::NotAcceptable => 406,
            StatusCode::ProxyAuthenticationRequired => 407,
            StatusCode::RequestTimeout => 408,
            StatusCode::Conflict => 409,
            StatusCode::Gone => 410,
            StatusCode::LengthRequired => 411,
            StatusCode::PreconditionFailed => 412,
            StatusCode::PayloadTooLarge => 413,
            StatusCode::UriTooLong => 414,
            StatusCode::UnsupportedMediaType => 415,
            StatusCode::RangeNotSatisfiable => 416,
            StatusCode::ExpectationFailed => 417,
            StatusCode::ImATeapot => 418,
            StatusCode::MisdirectedRequest => 421,
            StatusCode::UnprocessableEntity => 422,
            StatusCode::Locked => 423,
            StatusCode::FailedDependency => 424,
            StatusCode::TooEarly => 425,
            StatusCode::UpgradeRequired => 426,
            StatusCode::PreconditionRequired => 428,
            StatusCode::TooManyRequests => 429,
            StatusCode::RequestHeaderFieldsTooLarge => 431,
            StatusCode::UnavailableForLegalReasons => 451,

            // 5xx
            StatusCode::InternalServerError => 500,
            StatusCode::NotImplemented => 501,
            StatusCode::BadGateway => 502,
            StatusCode::ServiceUnavailable => 503,
            StatusCode::GatewayTimeout => 504,
            StatusCode::HttpVersionNotSupported => 505,
            StatusCode::VariantAlsoNegotiates => 506,
            StatusCode::InsufficientStorage => 507,
            StatusCode::LoopDetected => 508,
            StatusCode::NotExtended => 510,
            StatusCode::NetworkAuthenticationRequired => 511,
        }
    }
}

impl TryFrom<u16> for StatusCode {
    type Error = ();

    fn try_from(value: u16) -> Result<Self, Self::Error> {
        match value {
            // 1xx
            100 => Ok(StatusCode::Continue),
            101 => Ok(StatusCode::SwitchingProtocols),
            102 => Ok(StatusCode::Processing),
            103 => Ok(StatusCode::EarlyHints),

            // 2xx
            200 => Ok(StatusCode::Ok),
            201 => Ok(StatusCode::Created),
            202 => Ok(StatusCode::Accepted),
            203 => Ok(StatusCode::NonAuthoritativeInformation),
            204 => Ok(StatusCode::NoContent),
            205 => Ok(StatusCode::ResetContent),
            206 => Ok(StatusCode::PartialContent),
            207 => Ok(StatusCode::MultiStatus),
            208 => Ok(StatusCode::AlreadyReported),
            226 => Ok(StatusCode::ImUsed),

            // 3xx
            300 => Ok(StatusCode::MultipleChoices),
            301 => Ok(StatusCode::MovedPermanently),
            302 => Ok(StatusCode::Found),
            303 => Ok(StatusCode::SeeOther),
            304 => Ok(StatusCode::NotModified),
            305 => Ok(StatusCode::UseProxy),
            307 => Ok(StatusCode::TemporaryRedirect),
            308 => Ok(StatusCode::PermanentRedirect),

            // 4xx
            400 => Ok(StatusCode::BadRequest),
            401 => Ok(StatusCode::Unauthorized),
            402 => Ok(StatusCode::PaymentRequired),
            403 => Ok(StatusCode::Forbidden),
            404 => Ok(StatusCode::NotFound),
            405 => Ok(StatusCode::MethodNotAllowed),
            406 => Ok(StatusCode::NotAcceptable),
            407 => Ok(StatusCode::ProxyAuthenticationRequired),
            408 => Ok(StatusCode::RequestTimeout),
            409 => Ok(StatusCode::Conflict),
            410 => Ok(StatusCode::Gone),
            411 => Ok(StatusCode::LengthRequired),
            412 => Ok(StatusCode::PreconditionFailed),
            413 => Ok(StatusCode::PayloadTooLarge),
            414 => Ok(StatusCode::UriTooLong),
            415 => Ok(StatusCode::UnsupportedMediaType),
            416 => Ok(StatusCode::RangeNotSatisfiable),
            417 => Ok(StatusCode::ExpectationFailed),
            418 => Ok(StatusCode::ImATeapot),
            421 => Ok(StatusCode::MisdirectedRequest),
            422 => Ok(StatusCode::UnprocessableEntity),
            423 => Ok(StatusCode::Locked),
            424 => Ok(StatusCode::FailedDependency),
            425 => Ok(StatusCode::TooEarly),
            426 => Ok(StatusCode::UpgradeRequired),
            428 => Ok(StatusCode::PreconditionRequired),
            429 => Ok(StatusCode::TooManyRequests),
            431 => Ok(StatusCode::RequestHeaderFieldsTooLarge),
            451 => Ok(StatusCode::UnavailableForLegalReasons),

            // 5xx
            500 => Ok(StatusCode::InternalServerError),
            501 => Ok(StatusCode::NotImplemented),
            502 => Ok(StatusCode::BadGateway),
            503 => Ok(StatusCode::ServiceUnavailable),
            504 => Ok(StatusCode::GatewayTimeout),
            505 => Ok(StatusCode::HttpVersionNotSupported),
            506 => Ok(StatusCode::VariantAlsoNegotiates),
            507 => Ok(StatusCode::InsufficientStorage),
            508 => Ok(StatusCode::LoopDetected),
            510 => Ok(StatusCode::NotExtended),
            511 => Ok(StatusCode::NetworkAuthenticationRequired),

            _ => Err(()),
        }
    }
}

impl fmt::Display for StatusCode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let (code, text) = match self {
            // 1xx
            StatusCode::Continue => (100, "Continue"),
            StatusCode::SwitchingProtocols => (101, "Switching Protocols"),
            StatusCode::Processing => (102, "Processing"),
            StatusCode::EarlyHints => (103, "Early Hints"),

            // 2xx
            StatusCode::Ok => (200, "OK"),
            StatusCode::Created => (201, "Created"),
            StatusCode::Accepted => (202, "Accepted"),
            StatusCode::NonAuthoritativeInformation => (203, "Non-Authoritative Information"),
            StatusCode::NoContent => (204, "No Content"),
            StatusCode::ResetContent => (205, "Reset Content"),
            StatusCode::PartialContent => (206, "Partial Content"),
            StatusCode::MultiStatus => (207, "Multi-Status"),
            StatusCode::AlreadyReported => (208, "Already Reported"),
            StatusCode::ImUsed => (226, "IM Used"),

            // 3xx
            StatusCode::MultipleChoices => (300, "Multiple Choices"),
            StatusCode::MovedPermanently => (301, "Moved Permanently"),
            StatusCode::Found => (302, "Found"),
            StatusCode::SeeOther => (303, "See Other"),
            StatusCode::NotModified => (304, "Not Modified"),
            StatusCode::UseProxy => (305, "Use Proxy"),
            StatusCode::TemporaryRedirect => (307, "Temporary Redirect"),
            StatusCode::PermanentRedirect => (308, "Permanent Redirect"),

            // 4xx
            StatusCode::BadRequest => (400, "Bad Request"),
            StatusCode::Unauthorized => (401, "Unauthorized"),
            StatusCode::PaymentRequired => (402, "Payment Required"),
            StatusCode::Forbidden => (403, "Forbidden"),
            StatusCode::NotFound => (404, "Not Found"),
            StatusCode::MethodNotAllowed => (405, "Method Not Allowed"),
            StatusCode::NotAcceptable => (406, "Not Acceptable"),
            StatusCode::ProxyAuthenticationRequired => (407, "Proxy Authentication Required"),
            StatusCode::RequestTimeout => (408, "Request Timeout"),
            StatusCode::Conflict => (409, "Conflict"),
            StatusCode::Gone => (410, "Gone"),
            StatusCode::LengthRequired => (411, "Length Required"),
            StatusCode::PreconditionFailed => (412, "Precondition Failed"),
            StatusCode::PayloadTooLarge => (413, "Payload Too Large"),
            StatusCode::UriTooLong => (414, "URI Too Long"),
            StatusCode::UnsupportedMediaType => (415, "Unsupported Media Type"),
            StatusCode::RangeNotSatisfiable => (416, "Range Not Satisfiable"),
            StatusCode::ExpectationFailed => (417, "Expectation Failed"),
            StatusCode::ImATeapot => (418, "I'm a teapot"),
            StatusCode::MisdirectedRequest => (421, "Misdirected Request"),
            StatusCode::UnprocessableEntity => (422, "Unprocessable Entity"),
            StatusCode::Locked => (423, "Locked"),
            StatusCode::FailedDependency => (424, "Failed Dependency"),
            StatusCode::TooEarly => (425, "Too Early"),
            StatusCode::UpgradeRequired => (426, "Upgrade Required"),
            StatusCode::PreconditionRequired => (428, "Precondition Required"),
            StatusCode::TooManyRequests => (429, "Too Many Requests"),
            StatusCode::RequestHeaderFieldsTooLarge => (431, "Request Header Fields Too Large"),
            StatusCode::UnavailableForLegalReasons => (451, "Unavailable For Legal Reasons"),

            // 5xx
            StatusCode::InternalServerError => (500, "Internal Server Error"),
            StatusCode::NotImplemented => (501, "Not Implemented"),
            StatusCode::BadGateway => (502, "Bad Gateway"),
            StatusCode::ServiceUnavailable => (503, "Service Unavailable"),
            StatusCode::GatewayTimeout => (504, "Gateway Timeout"),
            StatusCode::HttpVersionNotSupported => (505, "HTTP Version Not Supported"),
            StatusCode::VariantAlsoNegotiates => (506, "Variant Also Negotiates"),
            StatusCode::InsufficientStorage => (507, "Insufficient Storage"),
            StatusCode::LoopDetected => (508, "Loop Detected"),
            StatusCode::NotExtended => (510, "Not Extended"),
            StatusCode::NetworkAuthenticationRequired => (511, "Network Authentication Required"),
        };

        write!(f, "{} {}", code, text)
    }
}

