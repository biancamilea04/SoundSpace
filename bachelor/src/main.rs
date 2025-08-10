use std::{fs, io::{BufReader, prelude::*}, net::{TcpListener, TcpStream}};

fn main() {
    //listen for TCP connections
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    //iterating over connection attempts
    for stream in listener.incoming() {
        let _stream = stream.unwrap();

        handle_connection(_stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();


    if request_line == "GET / HTTP/1.1" {
        let status_line = "HTTP/1.1 200 OK";
        let contents = fs::read_to_string("hello.html").unwrap();
        let length = contents.len();
        let response =
            format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");

        stream.write_all(response.as_bytes()).unwrap();
    } else {
        let status_line = "HTTP/1.1 400 Bad Request";
        let contents = fs::read_to_string("bad_request.html").unwrap();
        let length = contents.len();
        let response =
            format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");

        stream.write_all(response.as_bytes()).unwrap();
    }
}
