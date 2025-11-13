

export function Footer() {
  return (
    <footer id="footer">
      <div className="inner">
        <div className="content">
          <section>
            <h3>About Kimmetrics</h3>
            <p>Advanced sports analytics and statistics platform providing real-time NHL data and custom date range analysis.</p>
          </section>
          <section>
            <h4>Quick Links</h4>
            <ul className="alt">
              <li><a href="/nhl">NHL Standings</a></li>
              <li><a href="/nhl/teams">Teams</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </section>
          <section>
            <h4>Connect</h4>
            <ul className="plain">
              <li><a href="#"><i className="icon fa-twitter">&nbsp;</i>Twitter</a></li>
              <li><a href="#"><i className="icon fa-github">&nbsp;</i>GitHub</a></li>
            </ul>
          </section>
        </div>
        <div className="copyright">
          &copy; Kimmetrics. Data provided by NHL API.
        </div>
      </div>
    </footer>
  );
}
