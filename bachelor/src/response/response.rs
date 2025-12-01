use crate::response::http_status::{HttpStatus, Informational, Success, ClientError};

//TODO: IMPLEMENT HEADERS, BODY

#[derive(Clone,Debug)]
pub struct Response<T> {
    pub status_code: HttpStatus,
    pub body: T,
}

impl<T> Response<T> {
    pub fn new(status_code: HttpStatus, body: T) -> Response<T> {
        Response { status_code, body }
    }
}

// TO DO:
// I SHOULD SEE HOW TO MODIFY THE STATUS CODE SO THE RETURN IT COULD BE CLEANER
impl Response<String> {
    pub fn information() -> Response<String> {
        Response { status_code: HttpStatus::Informational(Informational::Continue), body: "Continue".to_string() }
    }

    pub fn not_found() -> Response<String> {
        Response { status_code: HttpStatus::ClientError(ClientError::NotFound), body: "Not Found".to_string() }
    }

    pub fn bad_request() -> Response<String> {
        Response { status_code: HttpStatus::ClientError(ClientError::BadRequest), body: "Bad Request".to_string() }
    }
}

impl From<String> for Response<String> {
    fn from(s: String) -> Response<String> {
        Response { status_code: HttpStatus::Success(Success::Ok), body: s }
    }
}
