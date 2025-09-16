use mime::Mime;

use crate::http::header::HeaderTrait;


// the accept header will have its name and the value witch will be a hashmap of mime types and their quality values
//every media type can have an quality number from 0 to 1, whtich means that the value variabile from Accept struct will be a hashmap of mime types and their quality values
pub struct Accept {
    pub name: String,
    pub values: Vec<Mime>,
}

impl HeaderTrait for Accept {
    fn new() -> Accept {
        Accept {
            name: "Accept".to_string(),
            values: Vec::new(),
        }
    }
}

impl Accept {
    pub fn set_values(){

    }
    pub fn get_name(&self) -> &String {
        &self.name
    }
    pub fn get_values(&self) -> &Vec<Mime> {
        &self.values
    }
}

//TO DO: IMPLEMENT THE SET HEADERVALUES FUNCTION