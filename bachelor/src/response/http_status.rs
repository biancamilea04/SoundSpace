//! This module defines HTTP status codes as enums and provides conversions and display implementations.
//! It categorizes status codes into Informational, Success, Redirection, Client Error, and Server Error.
//! Each category is represented by its own enum, and a top-level `HttpStatus` enum wraps them all.
//! Conversions from and to `u16` are implemented, along with `Display` for prettier strings.
//! This allows for type-safe handling of HTTP status codes in Rust applications.

use std::convert::TryFrom;
use std::fmt;

/// 1xx Informational HTTP status codes
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Informational {
    Continue,            // 100
    SwitchingProtocols,  // 101
    Processing,          // 102
    EarlyHints,          // 103
}

/// 2xx Success HTTP status codes
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Success {
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
}

/// 3xx Redirection HTTP status codes
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Redirection {
    MultipleChoices,                // 300
    MovedPermanently,               // 301
    Found,                          // 302
    SeeOther,                       // 303
    NotModified,                    // 304
    UseProxy,                       // 305
    TemporaryRedirect,              // 307
    PermanentRedirect,              // 308
}

/// 4xx Client Error HTTP status codes
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ClientError {
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
}

/// 5xx Server Error HTTP status codes
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ServerError {
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

/// Top-level HTTP status code enum, wrapping all categories
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HttpStatus {
    Informational(Informational),
    Success(Success),
    Redirection(Redirection),
    ClientError(ClientError),
    ServerError(ServerError),
}

// Conversion from each category to u16
impl From<Informational> for u16 {
    fn from(code: Informational) -> u16 {
        match code {
            Informational::Continue => 100,
            Informational::SwitchingProtocols => 101,
            Informational::Processing => 102,
            Informational::EarlyHints => 103,
        }
    }
}
impl From<Success> for u16 {
    fn from(code: Success) -> u16 {
        match code {
            Success::Ok => 200,
            Success::Created => 201,
            Success::Accepted => 202,
            Success::NonAuthoritativeInformation => 203,
            Success::NoContent => 204,
            Success::ResetContent => 205,
            Success::PartialContent => 206,
            Success::MultiStatus => 207,
            Success::AlreadyReported => 208,
            Success::ImUsed => 226,
        }
    }
}
impl From<Redirection> for u16 {
    fn from(code: Redirection) -> u16 {
        match code {
            Redirection::MultipleChoices => 300,
            Redirection::MovedPermanently => 301,
            Redirection::Found => 302,
            Redirection::SeeOther => 303,
            Redirection::NotModified => 304,
            Redirection::UseProxy => 305,
            Redirection::TemporaryRedirect => 307,
            Redirection::PermanentRedirect => 308,
        }
    }
}
impl From<ClientError> for u16 {
    fn from(code: ClientError) -> u16 {
        match code {
            ClientError::BadRequest => 400,
            ClientError::Unauthorized => 401,
            ClientError::PaymentRequired => 402,
            ClientError::Forbidden => 403,
            ClientError::NotFound => 404,
            ClientError::MethodNotAllowed => 405,
            ClientError::NotAcceptable => 406,
            ClientError::ProxyAuthenticationRequired => 407,
            ClientError::RequestTimeout => 408,
            ClientError::Conflict => 409,
            ClientError::Gone => 410,
            ClientError::LengthRequired => 411,
            ClientError::PreconditionFailed => 412,
            ClientError::PayloadTooLarge => 413,
            ClientError::UriTooLong => 414,
            ClientError::UnsupportedMediaType => 415,
            ClientError::RangeNotSatisfiable => 416,
            ClientError::ExpectationFailed => 417,
            ClientError::ImATeapot => 418,
            ClientError::MisdirectedRequest => 421,
            ClientError::UnprocessableEntity => 422,
            ClientError::Locked => 423,
            ClientError::FailedDependency => 424,
            ClientError::TooEarly => 425,
            ClientError::UpgradeRequired => 426,
            ClientError::PreconditionRequired => 428,
            ClientError::TooManyRequests => 429,
            ClientError::RequestHeaderFieldsTooLarge => 431,
            ClientError::UnavailableForLegalReasons => 451,
        }
    }
}
impl From<ServerError> for u16 {
    fn from(code: ServerError) -> u16 {
        match code {
            ServerError::InternalServerError => 500,
            ServerError::NotImplemented => 501,
            ServerError::BadGateway => 502,
            ServerError::ServiceUnavailable => 503,
            ServerError::GatewayTimeout => 504,
            ServerError::HttpVersionNotSupported => 505,
            ServerError::VariantAlsoNegotiates => 506,
            ServerError::InsufficientStorage => 507,
            ServerError::LoopDetected => 508,
            ServerError::NotExtended => 510,
            ServerError::NetworkAuthenticationRequired => 511,
        }
    }
}

/// Convert HttpStatus to u16
impl From<HttpStatus> for u16 {
    fn from(code: HttpStatus) -> u16 {
        match code {
            HttpStatus::Informational(code) => code.into(),
            HttpStatus::Success(code) => code.into(),
            HttpStatus::Redirection(code) => code.into(),
            HttpStatus::ClientError(code) => code.into(),
            HttpStatus::ServerError(code) => code.into(),
        }
    }
}

// TryFrom<u16> for each category
impl TryFrom<u16> for Informational {
    type Error = ();
    fn try_from(value: u16) -> Result<Self, Self::Error> {
        match value {
            100 => Ok(Informational::Continue),
            101 => Ok(Informational::SwitchingProtocols),
            102 => Ok(Informational::Processing),
            103 => Ok(Informational::EarlyHints),
            _ => Err(()),
        }
    }
}
impl TryFrom<u16> for Success {
    type Error = ();
    fn try_from(value: u16) -> Result<Self, Self::Error> {
        match value {
            200 => Ok(Success::Ok),
            201 => Ok(Success::Created),
            202 => Ok(Success::Accepted),
            203 => Ok(Success::NonAuthoritativeInformation),
            204 => Ok(Success::NoContent),
            205 => Ok(Success::ResetContent),
            206 => Ok(Success::PartialContent),
            207 => Ok(Success::MultiStatus),
            208 => Ok(Success::AlreadyReported),
            226 => Ok(Success::ImUsed),
            _ => Err(()),
        }
    }
}
impl TryFrom<u16> for Redirection {
    type Error = ();
    fn try_from(value: u16) -> Result<Self, Self::Error> {
        match value {
            300 => Ok(Redirection::MultipleChoices),
            301 => Ok(Redirection::MovedPermanently),
            302 => Ok(Redirection::Found),
            303 => Ok(Redirection::SeeOther),
            304 => Ok(Redirection::NotModified),
            305 => Ok(Redirection::UseProxy),
            307 => Ok(Redirection::TemporaryRedirect),
            308 => Ok(Redirection::PermanentRedirect),
            _ => Err(()),
        }
    }
}
impl TryFrom<u16> for ClientError {
    type Error = ();
    fn try_from(value: u16) -> Result<Self, Self::Error> {
        match value {
            400 => Ok(ClientError::BadRequest),
            401 => Ok(ClientError::Unauthorized),
            402 => Ok(ClientError::PaymentRequired),
            403 => Ok(ClientError::Forbidden),
            404 => Ok(ClientError::NotFound),
            405 => Ok(ClientError::MethodNotAllowed),
            406 => Ok(ClientError::NotAcceptable),
            407 => Ok(ClientError::ProxyAuthenticationRequired),
            408 => Ok(ClientError::RequestTimeout),
            409 => Ok(ClientError::Conflict),
            410 => Ok(ClientError::Gone),
            411 => Ok(ClientError::LengthRequired),
            412 => Ok(ClientError::PreconditionFailed),
            413 => Ok(ClientError::PayloadTooLarge),
            414 => Ok(ClientError::UriTooLong),
            415 => Ok(ClientError::UnsupportedMediaType),
            416 => Ok(ClientError::RangeNotSatisfiable),
            417 => Ok(ClientError::ExpectationFailed),
            418 => Ok(ClientError::ImATeapot),
            421 => Ok(ClientError::MisdirectedRequest),
            422 => Ok(ClientError::UnprocessableEntity),
            423 => Ok(ClientError::Locked),
            424 => Ok(ClientError::FailedDependency),
            425 => Ok(ClientError::TooEarly),
            426 => Ok(ClientError::UpgradeRequired),
            428 => Ok(ClientError::PreconditionRequired),
            429 => Ok(ClientError::TooManyRequests),
            431 => Ok(ClientError::RequestHeaderFieldsTooLarge),
            451 => Ok(ClientError::UnavailableForLegalReasons),
            _ => Err(()),
        }
    }
}
impl TryFrom<u16> for ServerError {
    type Error = ();
    fn try_from(value: u16) -> Result<Self, Self::Error> {
        match value {
            500 => Ok(ServerError::InternalServerError),
            501 => Ok(ServerError::NotImplemented),
            502 => Ok(ServerError::BadGateway),
            503 => Ok(ServerError::ServiceUnavailable),
            504 => Ok(ServerError::GatewayTimeout),
            505 => Ok(ServerError::HttpVersionNotSupported),
            506 => Ok(ServerError::VariantAlsoNegotiates),
            507 => Ok(ServerError::InsufficientStorage),
            508 => Ok(ServerError::LoopDetected),
            510 => Ok(ServerError::NotExtended),
            511 => Ok(ServerError::NetworkAuthenticationRequired),
            _ => Err(()),
        }
    }
}

/// Try to convert a u16 to HttpStatus
impl TryFrom<u16> for HttpStatus {
    type Error = ();
    fn try_from(value: u16) -> Result<Self, Self::Error> {
        if let Ok(code) = Informational::try_from(value) {
            return Ok(HttpStatus::Informational(code));
        }
        if let Ok(code) = Success::try_from(value) {
            return Ok(HttpStatus::Success(code));
        }
        if let Ok(code) = Redirection::try_from(value) {
            return Ok(HttpStatus::Redirection(code));
        }
        if let Ok(code) = ClientError::try_from(value) {
            return Ok(HttpStatus::ClientError(code));
        }
        if let Ok(code) = ServerError::try_from(value) {
            return Ok(HttpStatus::ServerError(code));
        }
        Err(())
    }
}

// Display implementations for each category
impl fmt::Display for Informational {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let (code, text) = match self {
            Informational::Continue => (100, "Continue"),
            Informational::SwitchingProtocols => (101, "Switching Protocols"),
            Informational::Processing => (102, "Processing"),
            Informational::EarlyHints => (103, "Early Hints"),
        };
        write!(f, "{} {}", code, text)
    }
}
impl fmt::Display for Success {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let (code, text) = match self {
            Success::Ok => (200, "OK"),
            Success::Created => (201, "Created"),
            Success::Accepted => (202, "Accepted"),
            Success::NonAuthoritativeInformation => (203, "Non-Authoritative Information"),
            Success::NoContent => (204, "No Content"),
            Success::ResetContent => (205, "Reset Content"),
            Success::PartialContent => (206, "Partial Content"),
            Success::MultiStatus => (207, "Multi-Status"),
            Success::AlreadyReported => (208, "Already Reported"),
            Success::ImUsed => (226, "IM Used"),
        };
        write!(f, "{} {}", code, text)
    }
}
impl fmt::Display for Redirection {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let (code, text) = match self {
            Redirection::MultipleChoices => (300, "Multiple Choices"),
            Redirection::MovedPermanently => (301, "Moved Permanently"),
            Redirection::Found => (302, "Found"),
            Redirection::SeeOther => (303, "See Other"),
            Redirection::NotModified => (304, "Not Modified"),
            Redirection::UseProxy => (305, "Use Proxy"),
            Redirection::TemporaryRedirect => (307, "Temporary Redirect"),
            Redirection::PermanentRedirect => (308, "Permanent Redirect"),
        };
        write!(f, "{} {}", code, text)
    }
}
impl fmt::Display for ClientError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let (code, text) = match self {
            ClientError::BadRequest => (400, "Bad Request"),
            ClientError::Unauthorized => (401, "Unauthorized"),
            ClientError::PaymentRequired => (402, "Payment Required"),
            ClientError::Forbidden => (403, "Forbidden"),
            ClientError::NotFound => (404, "Not Found"),
            ClientError::MethodNotAllowed => (405, "Method Not Allowed"),
            ClientError::NotAcceptable => (406, "Not Acceptable"),
            ClientError::ProxyAuthenticationRequired => (407, "Proxy Authentication Required"),
            ClientError::RequestTimeout => (408, "Request Timeout"),
            ClientError::Conflict => (409, "Conflict"),
            ClientError::Gone => (410, "Gone"),
            ClientError::LengthRequired => (411, "Length Required"),
            ClientError::PreconditionFailed => (412, "Precondition Failed"),
            ClientError::PayloadTooLarge => (413, "Payload Too Large"),
            ClientError::UriTooLong => (414, "URI Too Long"),
            ClientError::UnsupportedMediaType => (415, "Unsupported Media Type"),
            ClientError::RangeNotSatisfiable => (416, "Range Not Satisfiable"),
            ClientError::ExpectationFailed => (417, "Expectation Failed"),
            ClientError::ImATeapot => (418, "I'm a teapot"),
            ClientError::MisdirectedRequest => (421, "Misdirected Request"),
            ClientError::UnprocessableEntity => (422, "Unprocessable Entity"),
            ClientError::Locked => (423, "Locked"),
            ClientError::FailedDependency => (424, "Failed Dependency"),
            ClientError::TooEarly => (425, "Too Early"),
            ClientError::UpgradeRequired => (426, "Upgrade Required"),
            ClientError::PreconditionRequired => (428, "Precondition Required"),
            ClientError::TooManyRequests => (429, "Too Many Requests"),
            ClientError::RequestHeaderFieldsTooLarge => (431, "Request Header Fields Too Large"),
            ClientError::UnavailableForLegalReasons => (451, "Unavailable For Legal Reasons"),
        };
        write!(f, "{} {}", code, text)
    }
}
impl fmt::Display for ServerError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let (code, text) = match self {
            ServerError::InternalServerError => (500, "Internal Server Error"),
            ServerError::NotImplemented => (501, "Not Implemented"),
            ServerError::BadGateway => (502, "Bad Gateway"),
            ServerError::ServiceUnavailable => (503, "Service Unavailable"),
            ServerError::GatewayTimeout => (504, "Gateway Timeout"),
            ServerError::HttpVersionNotSupported => (505, "HTTP Version Not Supported"),
            ServerError::VariantAlsoNegotiates => (506, "Variant Also Negotiates"),
            ServerError::InsufficientStorage => (507, "Insufficient Storage"),
            ServerError::LoopDetected => (508, "Loop Detected"),
            ServerError::NotExtended => (510, "Not Extended"),
            ServerError::NetworkAuthenticationRequired => (511, "Network Authentication Required"),
        };
        write!(f, "{} {}", code, text)
    }
}

/// Display implementation for HttpStatus
impl fmt::Display for HttpStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            HttpStatus::Informational(code) => code.fmt(f),
            HttpStatus::Success(code) => code.fmt(f),
            HttpStatus::Redirection(code) => code.fmt(f),
            HttpStatus::ClientError(code) => code.fmt(f),
            HttpStatus::ServerError(code) => code.fmt(f),
        }
    }
}