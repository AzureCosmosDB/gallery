import React from "react";
import LinkItem from "@theme/Footer/LinkItem";
import styles from "./styles.module.css";
function SimpleLinkItem({ item }) {
  return item.html ? (
    <span
      className="footer__link-item"
      // Developer provided the HTML, so assume it's safe.
      dangerouslySetInnerHTML={{ __html: item.html }}
    />
  ) : (
    <LinkItem item={item} />
  );
}

// eslint-disable-next-line import/no-unused-modules
export default function FooterLinksSimple({ links }) {
  return (
    <div className={`footer__links text--center ${styles.footer__links}`}>
      {links.map((item, i) => (
        <React.Fragment key={i}>
          <SimpleLinkItem item={item} />
        </React.Fragment>
      ))}
    </div>
  );
}
