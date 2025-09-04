#[derive(Clone,Debug)]

pub struct Response<T> {
    pub status_code: u16,
    pub body: T,
}

impl<T> Response<T> {
    pub fn new(status_code: u16, body: T) -> Response<T> {
        Response { status_code, body }
    }
}

impl Response<String> {
    pub fn information() -> Response<String> {
        Response { status_code: 100, body: "Continue".to_string() }
    }

    pub fn not_found() -> Response<String> {
        Response { status_code: 404, body: "Not Found".to_string() }
    }

    pub fn bad_request() -> Response<String> {
        Response { status_code: 400, body: "Bad Request".to_string() }
    }
}

impl From<String> for Response<String> {
    fn from(s: String) -> Response<String> {
        Response { status_code: 200, body: s }
    }
}
