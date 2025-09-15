
use http::HeaderMap;

pub struct Accept {
    pub name: String,
    pub values: HeaderMap,
}

impl Accept {
    pub fn new() -> Accept {
        Accept {
            name: "Accept".to_string(),
            values: HeaderMap::new(),
        }
    }
    pub fn set_values(){

    }
    pub fn get_name(&self) -> &String {
        &self.name
    }
    pub fn get_values(&self) -> &HeaderMap {
        &self.values
    }
}

//TO DO: IMPLEMENT THE SET HEADERVALUES FUNCTION