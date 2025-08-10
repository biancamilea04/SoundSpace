use std::{
    io::{BufReader, prelude::*},
    net::{TcpListener, TcpStream}
};

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
    let http_request: Vec<_> = buf_reader
        .lines()
        .map(|result| result.unwrap())
        .take_while(|line| !line.is_empty())
        .collect();

    println!("Requests: {:?}", http_request);
}
