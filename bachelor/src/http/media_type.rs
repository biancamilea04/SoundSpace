//! MediaType is a tupla for handling HTTP Content-Type and Accept headers.
//! It is used to parse and generate media type strings.
//! It supports common media types like text/html, application/json, etc.
//! It provides methods to create, parse, and format media type strings.
//! It is used in HTTP request and response handling.

use mime::Mime;

pub struct MediaType{
    // The MIME type as a string, e.g., "text/html"
    // The quality factor (q-value) for the media type, ranging from 0.0 to 1.0
    // If quality is None, it means the default quality of 1.0
    mime: Mime,
    quality: Option<f32>
}

impl MediaType {
    pub fn new(mime: Mime, quality: Option<f32>) -> MediaType {
        MediaType { mime , quality }
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

    /// Returns the quality value of the media type. If not set, defaults to 1.0.
    pub fn get_quality_value(&self) -> f32 {
        self.quality.unwrap_or_else(|| 1.0)
    }

    /// Sets the quality value for the media type. Must be between 0.0 and 1.0.
    pub fn set_quality(&mut self, quality: f32) {
        if quality < 0.0 || quality > 1.0 {
            panic!("Quality value must be between 0.0 and 1.0");
        }
        self.quality = Some(quality);
    }

    pub fn is_more_specific(&self, other: &MediaType) -> bool {
        let quality_self = self.get_quality_value();
        let quality_other = other.get_quality_value();

        if quality_self < quality_other {
            return false;
        } else if quality_self > quality_other {
            return true;
        } else {
            self.is_more_speciffic_type(other)
        }
    }

    fn is_more_speciffic_type(&self, other: &MediaType) -> bool {
        let self_specificity = (self.mime.type_() != mime::STAR) as u8 + (self.mime.subtype() != mime::STAR) as u8;
        let other_specificity = (other.mime.type_() != mime::STAR) as u8 + (other.mime.subtype() != mime::STAR) as u8;

        if self_specificity != other_specificity {
            return self_specificity > other_specificity;
        } else {
            self.is_more_specific_subtype(other)
        }
    }

    fn is_more_specific_subtype(&self, other: &MediaType) -> bool {
        let self_specificity = (self.mime.subtype() != mime::STAR) as u8;
        let other_specificity = (other.mime.subtype() != mime::STAR) as u8;
        if self_specificity != other_specificity {
            return self_specificity > other_specificity;
        } else {
            self.is_more_specific_params(other)
        }
    }

    fn is_more_specific_params(&self, other: &MediaType) -> bool {
        let self_params = self.mime.params().count();
        let other_params = other.mime.params().count();
        self_params > other_params
    }
}