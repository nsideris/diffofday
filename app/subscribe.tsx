export const BUTTONDOWN = 'https://buttondown.com/diffofday';

export function Subscribe() {
  return (
    <form className="subscribe" action="https://buttondown.com/api/emails/embed-subscribe/diffofday" method="post" target="_blank">
      <label htmlFor="bd-email">Get it by email, weekday mornings</label>
      <div className="subscribe-row">
        <input id="bd-email" type="email" name="email" required placeholder="you@example.com" autoComplete="email" />
        <input type="hidden" name="embed" value="1" />
        <button type="submit" className="btn">Subscribe</button>
      </div>
      <p>Free. Sent with <a href={BUTTONDOWN}>Buttondown</a>. Unsubscribe from any email.</p>
    </form>
  );
}
