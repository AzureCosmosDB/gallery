import React from "react";
import LinkItem from "@theme/Footer/LinkItem";
import styles from "./styles.module.css";
function Separator({ id }) {
  return (
    <span className="footer__link-separator" id={id}>
      ·
    </span>
  );
}
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
          {links.length !== i + 1 && <Separator id={"footer__links_" + item.label} />}
        </React.Fragment>
      ))}
    </div>
  );
}
