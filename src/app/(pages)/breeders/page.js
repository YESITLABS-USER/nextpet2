"use client";
import React, { useState, useEffect } from "react";
import BASE_URL from "../../utils/constant";
import axios from "axios";
import Image from "next/image";
import { MdLocationOn } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { MdNavigateNext } from "react-icons/md";
import Pagination from "../../../components/Pagination";
import ContactModal from "../../../components/ContactModal";
import PreviouslyContacted from "../../../components/PreviouslyContacted";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Breeder = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreviousModal, setShowPreviousModal] = useState(false);
  const [activeRadio, setActiveRadio] = useState("");
  const [breederList, setBreederList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(8);
  const [filter, setFilter] = useState(null);
  const [location, setLocation] = useState(null);
  const [recentDate, setRecentDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalData, setModalData] = useState({
    breeder_id: "",
  });

  const { isAuthenticated } = useAuth(); 
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("user_user_id");
      setUserId(storedUserId);
    }
  }, []);

  // console.log("checkabreederid", breederList);
  useEffect(() => {
    getBreederList();
  }, [userId]);

  useEffect(() => {
    if (filter === "nearby" && navigator.geolocation) {
      setRecentDate(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setActiveRadio("nearby");
        },
        () => alert("Unable to retrieve your location.")
      );
    }
    if (filter === "recent") {
      setLocation(null);
      setRecentDate(filter);
      setActiveRadio("recent");
    }

    if (activeRadio == "nearby" || activeRadio == "recent") {
      getBreederList();
    }
  }, [filter, activeRadio]);

  const getBreederList = async () => {
    const userId = localStorage.getItem("user_user_id");
    let apiURL = userId
      ? `${BASE_URL}/api/all_breeders_listing`
      : `${BASE_URL}/api/all_breeders_listing_without_login`;

    let apiData = {
      user_id: userId,
      recent: recentDate,
      latitude: location?.lat,
      longitude: location?.lon,
    };
    const response = await axios.post(apiURL, apiData);
    if (response.data.code === 200) {
      setBreederList(
        response.data.breeder
          ? response.data.breeder
          : response.data.all_breeders
      );
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    if (event.target.value.length < 3) {
      setFilteredData();
    }
  };

  const handleSearch = () => {
    let filtered = breederList.filter((breeder) => {
      const query = searchQuery.toLowerCase();

      return (
        breeder.name?.toLowerCase().includes(query) ||
        breeder.location?.toLowerCase().includes(query) ||
        ""
      );
    });

    setFilteredData(filtered);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handlePostLike = async (value) => {
    let checkLikeDislike = value?.like_colour == null ? 1 : 111;
    let likeData = {
      user_id: localStorage.getItem("user_user_id"),
      breeder_id: value?.breeder_id || "",
      like_post: checkLikeDislike,
    };
    try {
      const response = await axios.post(
        `${BASE_URL}/api/breeder_like`,
        likeData
      );
      if (response.data.code === 200) {
        getBreederList();
      }
    } catch (err) {
      console.error("error : ", err);
    }
  };

  // Logic for pagination
  let petsData = filteredData?.length > 0 ? filteredData : breederList;
  let allfilteredData = filteredData?.length > 0 ? filteredData : [];

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = (searchQuery.length>3) && filteredData ? allfilteredData.slice(indexOfFirstPost, indexOfLastPost) : petsData.slice(indexOfFirstPost, indexOfLastPost);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleModal = (value) => {
    let checkConnect = value?.breeder_do_not_show_me == null ? 1 : 0;
    setModalData({
      user_id: userId,
      breeder_id: value?.breeder_id,
      breeder_do_not_show_me: checkConnect,
      "date_contacts_breeder" : value?.date_contacts_breeder
    });
    if (checkConnect == 1) {
      setShowModal(true);
    } else {
      setShowPreviousModal(true);
    }
  };

  const closeModal = () => {
    getBreederList();
    setShowModal(false);
    setShowPreviousModal(false);
  };

  function handleModel() {
    setDropdownVisible(!isDropdownVisible);
  }

  function handleAuth() {
    router.push("/map-breeder");
  }
  
  function handleMail(item) {
    if(isAuthenticated){
      handleModal(item) 
    } else{
      toast.error("User must be logged in");
      setTimeout(() => {
        router.push('/user/sign-in');
      }, 1000);
    }
  }

  return (
    <>
      <div className="breeder-main-wrap">
        <div className="container">
          <div className="aligns-filter-pets">
            <div className="searchbar-filter-sec">
              <div className="search-wrap">
                {/* <form action=""> */}
                <div style={{ width: "90%" }}>
                  <label htmlFor="">
                    <input
                      id="search-input"
                      type="text"
                      value={searchQuery}
                      onKeyDown={handleKeyDown}
                      onChange={handleSearchChange}
                      placeholder="Search by Breeder or Location"
                    />
                    <button onClick={handleSearch}>
                      <Image
                        src="/images/Nextpet-imgs/all-icons/serch2.svg"
                        width={20}
                        height={20}
                        alt=""
                      />
                    </button>
                  </label>
                  {/* </form> */}
                </div>
              </div>
            </div>
            <div className="search-filter-sec">
              <div className="pets-filters-wrap">
                <div className="filter-sec">
                  <div className="quotes2">
                    <div className="dropdown-filterbtn" onClick={handleModel}>
                      Sort
                      <img
                        src="/images/Nextpet-imgs/dashboard-imgs/mi_filter.svg"
                        alt=""
                      />
                    </div>
                    <div
                      className="dropdown-showfilter"
                      style={{
                        display: isDropdownVisible ? "block" : "none",
                      }}
                    >
                      <div className="quotes-list">
                        <div className="filter-data-list">
                          <input
                            type="radio"
                            name="exp_language2"
                            value="nearby"
                            checked={filter === "nearby"}
                            onChange={() => setFilter("nearby")}
                          />
                          <p>Nearby</p>
                        </div>
                        <div className="filter-data-list">
                          <input
                            type="radio"
                            name="exp_language2"
                            value="recent"
                            checked={filter === "recent"}
                            onChange={() => setFilter("recent")}
                          />
                          <p>Recent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="location-filter">
                <span style={{ borderRadius: "10px 0 0 10px", color: '#fff', border: 'none', width: '50px', fontWeight: '500', border: '1px solid #d1d1d1', height: '44px', cursor: 'pointer', background: '#fff'}}  onClick={handleAuth} >
                    <MdLocationOn
                      className="fas fa-map-marker-alt"
                      // onClick={}
                      style={{
                        color: "#e49a01",
                        margin: "12px",
                        cursor: "pointer",
                      }}
                      size={20}
                    />
                  </span>
                  <button type="button">
                    <img
                      src="/images/Nextpet-imgs/all-icons/filter-map-icon.svg"
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pets-breeder-cards">
          {currentPosts?.length === 0 ? (
              <h1 style={{ fontFamily:'GoodDog New', display:'flex', justifyContent:'center', width:'100%', padding:'50px 0'}}> No Data Found...</h1>
            ) : (
            currentPosts?.map((item, index) => (
              <div className="newyear-cat-dog-in" key={index}>
                <div className="popular-breedersimg-wrap">
                  <Image
                    src={item?.image || "/images/Nextpet-imgs/Image_not_available.webp"}
                    width={250}
                    height={206}
                    alt="profile"
                    loading="lazy"
                  />
                  <div
                    className="heart-icon-wrap"
                    onClick={() => handlePostLike(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <Image
                      width={15}
                      height={15}
                      src={
                        item?.like_colour == null
                          ? "/images/Nextpet-imgs/dashboard-imgs/heart-border2.svg"
                          : "/images/Nextpet-imgs/dashboard-imgs/heart-fill.svg"
                      }
                      alt=""
                      className="active"
                    />
                    <span>{item?.like_count}</span>
                  </div>
                </div>

                <div className="newyear-content-card">
                  <div className="heading-content">
                    <h3>{item?.name}</h3>
                    <div className="rating-wrap">
                      <span>
                        {/* {item?.star_rating || 0}&nbsp;{" "} */}
                        {(Math.round((parseFloat(item?.star_rating || "0")) * 10) / 10).toFixed(1) || 0} &nbsp;
                        <FaStar
                          style={{
                            color: "white",
                            marginBottom: "4px",
                          }}
                        />
                      </span>
                    </div>
                    <div
                      className="mail-boxwrap"
                      onClick={() => handleMail(item)}
                      style={{ cursor: "pointer" }}
                    >
                      <Image
                        width={15}
                        height={15}
                        src={
                          item?.contacts_colour_breeder == null
                            ? "/images/Nextpet-imgs/dashboard-imgs/yellow-mail-letter.svg"
                            : "/images/Nextpet-imgs/newyear-cats-imgs/mail.svg"
                        }
                        alt=""
                      />
                      <div
                        className="mail-count"
                        data-bs-target="#previous-information"
                        data-bs-toggle="modal"
                      >
                        <span>{item?.breeder_total_count_all || 0}</span>
                      </div>
                    </div>
                  </div>

                  <p className="pt-1">
                  {item?.bio && item?.bio.length > 50 
                  ? item.bio.slice(0, 30) + "..." : item?.bio || "No Description available"}

                  </p>

                  <div className="viewmore-wrap">
                    <h4>{item?.breeder_post_count} active posts</h4>
                    <div className="action-wrap">
                      <a
                      // router.push(`/user/breeder-profile/${slide.breeder_id}/${likeId} `)
                        href={`/user/breeder-profile/${item?.breeder_id}/${item?.like_colour} `}
                      >
                        View More&nbsp;{" "}
                        <MdNavigateNext
                          size={25}
                          style={{ marginLeft: "10px" }}
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )))}
          </div>

          <div className="influ-pagi pt-4">
            <Pagination
              postPerPage={postsPerPage}
              totalPosts={currentPosts?.length === 0 || petsData?.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        </div>
        <ContactModal
          modalIsOpen={showModal}
          closeModal={closeModal}
          modalDetails={modalData}
        />
        <PreviouslyContacted
          modalIsOpen={showPreviousModal}
          closeModal={closeModal}
          modalDetails={modalData}
        />
      </div>
    </>
  );
};

export default Breeder;
