use std::sync::{mpsc, Arc, Mutex};
use std::thread;

// TO DO: separate file for Job structure
type Job = Box<dyn FnOnce() + Send + 'static>;
pub struct Worker {
    pub(crate) id: usize,
    pub(crate) thread: thread::JoinHandle<()>,
}

impl Worker {
    pub fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            while let Ok(job) = receiver.lock().unwrap().recv() {
                println!("Worker {id} got a job; executing.");

                job();
            }
        });

        Worker {id, thread}
    }
}