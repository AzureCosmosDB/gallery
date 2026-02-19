import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import styles from "../styles.module.css";

import ShowcaseCards from "../../../../resource-library/views/ShowcaseCards";
import { User } from "src/data/tags";

export function FeaturedResourcesSlider({
  featuredUsers,
  forceShowTileNumber,
}: {
  featuredUsers: User[];
  forceShowTileNumber: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <>
      <Swiper
        spaceBetween={12}
        slidesPerView={1}
        slidesPerGroup={1}
        centeredSlides
        className={styles.featuredSlider}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        onInit={(swiper) => setCurrentIndex(swiper.realIndex || 0)}
        onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex || 0)}
        pagination={{ clickable: true }}
        breakpoints={{
          768: { slidesPerView: 1, spaceBetween: 24, centeredSlides: false },
          320: { slidesPerView: 1.2, spaceBetween: 12, centeredSlides: true },
        }}
        modules={[Autoplay, Pagination]}
      >
        {featuredUsers.map((user) => (
          <SwiperSlide key={user.title}>
            <ShowcaseCards
              filteredUsers={[user]}
              coverPage
              noGrid
              forceShowTileNumber={forceShowTileNumber}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className={styles.numericPagination} aria-hidden={false}>
        <span className={styles.numericCurrent}>{currentIndex + 1}</span>
        <span className={styles.numericSlash}> / </span>
        <span className={styles.numericTotal}>{featuredUsers.length}</span>
      </div>
    </>
  );
}
