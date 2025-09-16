//! MediaType is a tupla for handling HTTP Content-Type and Accept headers.
//! It is used to parse and generate media type strings.
//! It supports common media types like text/html, application/json, etc.
//! It provides methods to create, parse, and format media type strings.
//! It is used in HTTP request and response handling.
//! this MediaType model is it inspired by the Spring Framework MediaType class

use mime::Mime;

/// TO DO:
/// - isCompatibleWith function
/// - copyQyalityValue and removeQualityValue function
///  - add tests
///
/// In Spring there are specific types for the MediaType like APPLICATION_JSON, TEXT_HTML, WILDCARD etc.
/// I could add them as associated constants.
///
/// Other spring function that can be implemented:
/// - parseMediaType
/// - parseMediaTypes
/// - equals
/// - compareTo
///
///  Maybe creating a more specific way of constructing the media type
/// - add a function to create a media type from type, subtype and parameters
/// - add a function to create a media type from type and subtype
/// - add a function to create a media type from type, subtype and quality value
/// - add a function to create a media type from type, subtype, parameters and quality value
/// - add a function to create a media type from type, subtype and parameters and quality value
///
/// Maybe find a way to not depend on the mime crate to much


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
        let mime = mime_str.parse::<Mime>().unwrap_or_else(|_| panic!("Failed to parse MIME type from string: '{}'", mime_str));
        MediaType { mime, quality: None }
    }

    // cargo clippy message:
    // warning: implementation of inherent method `to_string(&self) -> String` for type `http::media_type::MediaType`
    // help: implement trait `Display` for type `http::media_type::MediaType` instead
    pub fn to_string(&self) -> String {
        match self.quality {
            Some(q) => format!("{}; q={}", self.mime, q),
            None => self.mime.to_string(),
        }
    }

    pub fn get_mime(&self) -> &Mime {
        &self.mime
    }

    pub fn get_type(&self) -> &str {
        self.mime.type_().as_str()
    }

    pub fn get_subtype(&self) -> &str {
        self.mime.subtype().as_str()
    }

    pub fn get_params(&self) -> Vec<(&str, &str)> {
        self.mime.params().map(|(k, v)| (k.as_str(), v.as_str())).collect()
    }

    /// Returns the quality value of the media type. If not set, defaults to 1.0.
    pub fn get_quality_value(&self) -> f32 {
        self.quality.unwrap_or( 1.0)
    }

    /// Sets the quality value for the media type. Must be between 0.0 and 1.0.
    pub fn set_quality(&mut self, quality: f32) {
        if !(0.0..=1.0).contains(&quality) {
            panic!("Quality value must be between 0.0 and 1.0");
        }
        self.quality = Some(quality);
    }

    pub fn includes(&self, other: &MediaType) -> bool {
        if self.mime.type_() == mime::STAR {
            return true;
        } else if self.mime.type_() == other.mime.type_() {
                if self.mime.subtype() == other.mime.subtype() {
                    return true;
                }

                if self.mime.subtype() == mime::STAR {
                      let self_plus_idx = self.mime.subtype().as_str().find('+');
                      if self_plus_idx.is_none() {
                          return true;
                      }

                      let other_plus_idx = other.mime.subtype().as_str().find('+');
                        if other_plus_idx.is_some() {
                            let self_subtype_no_suffix = &self.mime.subtype().as_str()[..self_plus_idx.unwrap()];
                            let self_subtype_suffix = &self.mime.subtype().as_str()[self_plus_idx.unwrap() + 1..];
                            let other_subtype_suffix = &other.mime.subtype().as_str()[other_plus_idx.unwrap() + 1..];
                            if (self_subtype_suffix == other_subtype_suffix) && (self_subtype_no_suffix == "*") {
                                return true;
                            }
                        }
                }
        }

        false
    }

    /// Compares the specificity of this media type with another.
    /// Returns true if this media type is more specific than the other.
    /// Specificity is determined first by quality value, then by type/subtype specificity, and finally by number of parameters.
    pub fn is_more_specific(&self, other: &MediaType) -> bool {
        let quality_self = self.get_quality_value();
        let quality_other = other.get_quality_value();

        if quality_self < quality_other {
            false
        } else if quality_self > quality_other {
            return true;
        } else {
            self.is_more_specific_type(other)
        }
    }


    /// functions to check if a media type is less specific than another
    pub fn is_less_specific(&self, other: &MediaType) -> bool {
        other.is_more_specific(self)
    }

    fn is_more_specific_type(&self, other: &MediaType) -> bool {
        let self_specificity = (self.mime.type_() != mime::STAR) as u8 + (self.mime.subtype() != mime::STAR) as u8;
        let other_specificity = (other.mime.type_() != mime::STAR) as u8 + (other.mime.subtype() != mime::STAR) as u8;

        if self_specificity != other_specificity {
            self_specificity > other_specificity
        } else {
            self.is_more_specific_subtype(other)
        }
    }

    fn is_more_specific_subtype(&self, other: &MediaType) -> bool {
        let self_specificity = (self.mime.subtype() != mime::STAR) as u8;
        let other_specificity = (other.mime.subtype() != mime::STAR) as u8;
        if self_specificity != other_specificity {
            self_specificity > other_specificity
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