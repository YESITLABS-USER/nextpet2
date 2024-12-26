"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
// import Link from "next/link";
// import { MdNavigateNext } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import ContactModal from "../components/ContactModal";
import PreviouslyContacted from "../components/PreviouslyContacted";
import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const HomeRecentlyPostedSlider = ({ slides, onLike }) => {
  const [slidesPerView, setSlidesPerView] = useState(4);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const { isAuthenticated } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setSlidesPerView(1);
      } else if (window.innerWidth <= 1000) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(4);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [showPreviouslyContactedModal, setShowPreviouslyContactedModal] =
    useState(false);
  const [modalData, setModalData] = useState({
    post_id: "",
    breeder_id: "",
  });

  const handleModal = (post_id, breeder_id, total_contact) => {
    setModalData({ post_id, breeder_id, "total_contacts" : total_contact });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handlePreviouslyContactedModal = (post_id, breeder_id, date_contacts_breeder ) => {
    setModalData({ post_id, breeder_id, "date_contacts_breeder": date_contacts_breeder });
    setShowPreviouslyContactedModal(true);
  };

  const closePreviouslyContactedModal = () => {
    setShowPreviouslyContactedModal(false);
  };

  function likeHandler(slide) {
    if (isAuthenticated) {
      onLike( slide.user_breeder_id, slide.id, slide.check_like )
    } else {
      toast.error("User must be logged in");
      setTimeout(() => {
        router.push('/user/sign-in');
      }, 1000);
    }
  }
  function handleViewMore (slide) {
    router.push(`/user/posts/${slide.user_breeder_id}/${slide.id}/${slide.like_colour}`)
    // if(isAuthenticated){
    //   router.push(`/user/trending-pets/${slide.user_breeder_id}/${slide.id}`)
    // } else{
    //   toast.error("User must be logged in");
    //   setTimeout(() => {
    //     router.push('/user/sign-in');
    //   }, 1000);
    // }
  }

  function handleMail(slide) {
    if(isAuthenticated){
      handleModal(slide.id, slide.user_breeder_id, slide.total_contact, slide?.date_contacts_breeder)
    } else{
      toast.error("User must be logged in");
      setTimeout(() => {
        router.push('/user/sign-in');
      }, 1000);
    }
  }


  return (
    <>
      <div
        className="recentposted-cat-dog-wrap mt-5"
        style={{ position: "relative" }}
      >
        <div className="custom-navigation">
          <button ref={prevRef} className="swiper-button-prev" />
          <button ref={nextRef} className="swiper-button-next" />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h1>Trending Pets</h1>
            </div>
            <div id="recentposted-cat-dog-slider" className="owl-carousel">
              <div className="col-lg-12">
                <Swiper
                  slidesPerView={slidesPerView}
                  spaceBetween={30}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  // pagination={{ clickable: true }}
                  navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                  }}
                  onBeforeInit={(swiper) => {
                    swiper.params.navigation.prevEl = prevRef.current;
                    swiper.params.navigation.nextEl = nextRef.current;
                  }}
                  modules={[Autoplay, Pagination, Navigation]}
                  className="mySwiper"
                >
                  {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                      <div key={index} className="slider-item">
                        <div className="recentposted-cat-dog-in">
                          <div className="trending-pets-wrap">
                            <Image src={Array.isArray(slide.image) && slide.image.length > 0 ? slide.image[0] : "/images/Nextpet-imgs/Image_not_available.webp"} alt="Pet image" 
                              width={500} 
                              height={300}
                              loading="lazy" 
                            />
                            <div
                              className="heart-icon-wrap"
                              onClick={() => likeHandler(slide)}
                              style={{ cursor: "pointer" }}
                            >
                              {slide.check_like === "1" ? (
                                <Image
                                  src="/images/Nextpet-imgs/dashboard-imgs/heart-fill.svg"
                                  alt="Heart Fill"
                                  className="active"
                                  width={24}  
                                  height={24} 
                                />
                              ) : (
                                <Image
                                  src="/images/Nextpet-imgs/dashboard-imgs/heart-border2.svg"
                                  alt="Heart Border"
                                  className="active"
                                  width={24}  
                                  height={24} 
                                />
                              )}
                              <span  style={{left: '50%', transform: 'translateX(-50%)', textAlign: 'center'}}>
                                {slide.total_like ? slide.total_like : 0}
                              </span>
                            </div>
                          </div>

                          <div className="recentposted-content-card">
                            <div className="heading-content">
                              <h3>{slide.name ? slide.name : "Animal"}</h3>
                              {slide.contacts_colour == 1 ? (
                                <div
                                  className="mail-boxwrap"
                                  onClick={() =>
                                    handlePreviouslyContactedModal(
                                      slide.id,
                                      slide.user_breeder_id, slide.contacts_date
                                    )
                                  }
                                  style={{
                                    cursor: "pointer",
                                  }}
                                >
                                  <Image
                                    src="/images/Nextpet-imgs/newyear-cats-imgs/mail.svg"
                                    alt="Mail"
                                    width={20}
                                    height={20}
                                  />
                                  <div
                                    className="mail-count pt-1"
                                    style={{
                                      cursor: "pointer",
                                    }}
                                  >
                                    <span>
                                      {slide.total_contact
                                        ? slide.total_contact
                                        : 0}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  name="mail-boxwrap"
                                  onClick={() => handleMail(slide)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <Image
                                    src="/images/Nextpet-imgs/dashboard-imgs/yellow-mail-letter.svg"
                                    alt="Mail Icon"
                                    width={35} height={35} className="p-2"
                                    style={{boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', borderRadius:"50%"}}
                                  />
                                  <div
                                    
                                    style={{
                                      cursor: "pointer",
                                    }}
                                  >
                                    <span>
                                      {slide.total_contact
                                        ? slide.total_contact
                                        : 0}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* <p>
                              {slide.description
                                ? slide.description
                                    .split("")
                                    .slice(0, 10)
                                    .join("")
                                : "Description Not Available... "}
                            </p> */}
                            <p>
                              {slide.description
                                ? slide.description.length > 50
                                  ? `${slide.description.slice(0, 50)}...`
                                  : slide.description
                                : "Description not available"}
                            </p>
                            <div className="viewmore-wrap">
                              <h4>${slide.price ? slide.price : ""}</h4>
                              {/* <div className="action-wrap">
                                <Link
                                  href={`/user/trending-pets/${slide.user_breeder_id}/${slide.id}`}
                                >
                                  View More<MdNavigateNext size={25} />
                                </Link>
                              </div> */}
                              <div className="action-wrap" onClick={() => handleViewMore(slide)} style={{fontSize:'14px', color:'#4e4e4e', cursor:'pointer'}}>
                              View More  &gt;
                            </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .custom-navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            z-index: 10;
            pointer-events: none;
          }

          .swiper-button-prev,
          .swiper-button-next {
            pointer-events: auto;
            background-color: white;
            color: rgba(0, 0, 0, 0.5);
            padding: 15px 15px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            margin: 0 50px;
            border: none;
            border-radius: 15px 0 0 15px;
          }

          .swiper-button-next {
            border-radius: 0 15px 15px 0;
          }
          .recentposted-cat-dog-wrap {
            --swiper-navigation-size: 15px;
          }
        `}</style>
      </div>

      <ContactModal
        modalIsOpen={showModal}
        closeModal={closeModal}
        modalDetails={modalData}
        onLike = {onLike}
      />
      <PreviouslyContacted
        modalIsOpen={showPreviouslyContactedModal}
        closeModal={closePreviouslyContactedModal}
        modalDetails={modalData}
      />
    </>
  );
};

export default HomeRecentlyPostedSlider;
