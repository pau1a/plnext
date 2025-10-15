// src/app/contact/page.tsx
import { sendMessage } from "./send";

export default function Contact() {
  return (
    <form action={sendMessage} className="surface u-pad-2xl form-shell u-max-w-md u-center">
      <h1 className="heading-section">Contact</h1>
      <div className="form-field">
        <label className="form-field__label" htmlFor="name">
          Name
        </label>
        <input id="name" name="name" className="form-field__control" required />
      </div>
      <div className="form-field">
        <label className="form-field__label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" className="form-field__control" required />
      </div>
      <div className="form-field">
        <label className="form-field__label" htmlFor="message">
          Message
        </label>
        <textarea id="message" name="message" className="form-field__control" rows={5} required />
      </div>
      <button className="button button--primary" type="submit">
        <i className="fa-solid fa-paper-plane" aria-hidden="true" />
        <span>Send</span>
      </button>
    </form>
  );
}
