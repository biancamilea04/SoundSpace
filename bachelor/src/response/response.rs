
#[derive(Clone,Debug)]
pub struct Response {
    pub status_code: u16,
    pub body: String,
}

impl Response {
    pub fn new(status_code: u16, body: String) -> Response {
        Response { status_code, body }
    }

    pub fn not_found() -> Response {
        Response { status_code: 404, body: "Not Found".to_string() }
    }

    pub fn bad_request() -> Response {
        Response { status_code: 400, body: "Bad Request".to_string() }
    }
}

impl From<String> for Response {
    fn from(s: String) -> Response {
        Response { status_code: 200, body: s }
    }
}
