
use http::Method;

#[derive(Clone,Debug)]
pub struct Request {
    method: Method,
    pub path: String,
    //TO DO: ADD HEADERS, BODY, QUERY PARAM ETC.
}