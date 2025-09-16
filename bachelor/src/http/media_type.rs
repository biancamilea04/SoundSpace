//! MediaType is a tupla for handling HTTP Content-Type and Accept headers.
//! It is used to parse and generate media type strings.
//! It supports common media types like text/html, application/json, etc.
//! It can also handle custom media types.
//! It provides methods to create, parse, and format media type strings.
//! It is used in HTTP request and response handling.

use mime::Mime;

pub struct MediaType{
    // The MIME type as a string, e.g., "text/html"
    // The quality factor (q-value) for the media type, ranging from 0.0 to 1.0
    // If quality is None, it means the default quality of 1.0
    pub mime: Mime,
    pub quality: Option<f32>
}

impl MediaType {
    pub fn new(mime: Mime, quality: Option<f32>) -> MediaType {
        MediaType { mime , quality }
    }

    /// Returns the quality value of the media type. If not set, defaults to 1.0.
    pub fn get_quality_value(&self) -> f32 {
        self.quality.unwrap_or_else(|| 1.0)
    }

    pub fn parse(mime_str: &str) -> MediaType {
        let mime = mime_str.parse::<Mime>().expect(&format!("Failed to parse MIME type from string: '{}'", mime_str));
        MediaType { mime, quality: None }
    }

    pub fn to_string(&self) -> String {
        match self.quality {
            Some(q) => format!("{}; q={}", self.mime, q),
            None => self.mime.to_string(),
        }
    }
}