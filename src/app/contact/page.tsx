// src/app/contact/page.tsx
import { sendMessage } from "./send";

export default function Contact() {
  return (
    <form action={sendMessage} className="mx-auto" style={{ maxWidth: 640 }}>
      <h1 className="h2 mb-4">Contact</h1>
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input name="name" className="form-control" required />
      </div>
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input name="email" type="email" className="form-control" required />
      </div>
      <div className="mb-3">
        <label className="form-label">Message</label>
        <textarea name="message" className="form-control" rows={5} required />
      </div>
      <button className="btn btn-primary">
        <i className="fa-solid fa-paper-plane me-2" />
        Send
      </button>
    </form>
  );
}

