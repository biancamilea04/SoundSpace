use mime::Mime;
use crate::http::header::HeaderTrait;
use crate::http::media_type::MediaType;

// the accept header will have its name and the value witch will be a hashmap of mime types and their quality values
//every media type can have a quality number from 0 to 1, whtich means that the value variabile from Accept struct will be a hashmap of mime types and their quality values
pub struct Accept {
    pub name: String,
    pub values: Option<Vec<MediaType>>,
}

impl HeaderTrait for Accept {
    fn new() -> Accept {
        Accept {
            name: "Accept".to_string(),
            values: None,
        }
    }
}

impl Accept {
    pub fn set_values( &mut self, values: Vec<MediaType>) {
        self.values = Some(values);
    }
    pub fn get_name(&self) -> &String {
        &self.name
    }
    pub fn get_values(&self) -> &Option<Vec<MediaType>> {
        &self.values
    }
}