mod worker;
mod http;
mod request;
mod response;
mod router;

use std::sync::{mpsc, Arc, Mutex};
use worker::Worker;

type Job = Box<dyn FnOnce() + Send + 'static>;

pub struct ThreadPool{
    workers: Vec<Worker>,
    sender:  Option<mpsc::Sender<Job>>,
}

impl ThreadPool {
    // the new function panic if the size is zero
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();
        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)))
        }

        ThreadPool { workers,  sender: Some(sender) }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static
    {
        let job = Box::new(f);

        self.sender.as_ref().unwrap().send(job).unwrap();
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        drop(self.sender.take());

        for worker in self.workers.drain(..) {
            println!("Worker {} is being shut down", worker.id);

            worker.thread.join().unwrap();
        }
    }
}