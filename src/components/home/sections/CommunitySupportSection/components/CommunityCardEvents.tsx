import React from "react";
import * as LucideIcons from "lucide-react";
import styles from "../CommunitySupportSection.module.css";
import type { EventItem } from "../types";
import { formatEventDate } from "../utils/dates";

export function CommunityCardEvents({ events }: { events: EventItem[] }) {
  const hasEvents = events.length > 0;

  return (
    <div className={hasEvents ? styles.eventsContainer : styles.eventsContainerEmpty}>
      {hasEvents ? (
        events.map((event) => (
          <div key={`${event.title}-${event.date}`} className={styles.eventTile}>
            <div className={styles.eventTitle}>{event.title}</div>
            <div className={styles.eventDescription}>{event.description}</div>
            <div className={styles.eventDateTime}>
              <span className={styles.eventDate}>{formatEventDate(event.date)}</span>
              <span className={styles.eventTime}>{event.time}</span>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>
          <LucideIcons.Calendar size={48} className={styles.emptyStateIcon} />
          <div className={styles.emptyStateTitle}>No Upcoming Events</div>
          <div className={styles.emptyStateDescription}>
            Check back soon for new webinars and events
          </div>
        </div>
      )}
    </div>
  );
}
