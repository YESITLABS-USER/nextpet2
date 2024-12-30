"use client";
import { React, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import moment from "moment";
import { FaStar } from "react-icons/fa";
import { ShowNotes, AddNotes, StatusNotesLeadsUpdate, GetRatting, SetRatting,StatusLeadsBreederDetails, } from "../../../services/breeder";
import { useRouter } from "next/navigation";

const Contacted = () => {
  const [addNotes, setAddNotes] = useState();
  const [showBreederNotes, setBreederShowNotes] = useState();
  const [pageData, setPageData] = useState({});

  // const [rating, setRating] = useState(3);
  const [user_id, setUserId] = useState();
  const [post_id, setPostId] = useState();
  const [breeder_id, setBreederId] = useState();
  const [errors, setErrors] = useState();
  const router = useRouter();
  const [ratings, setRatings] = useState({"politeness_rating": "0", "responsive_rating": "0", 
    "communication_rating": "0" });
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryParams = new URLSearchParams(window.location.search);
      setUserId(queryParams.get("user_id") || "");
      setPostId(queryParams.get("post_id") || "");
      setBreederId(queryParams.get("breeder_id") || "");
    }
  }, []);

  useEffect(() => {
    if (user_id && post_id && breeder_id) {
      loadData();
    }
  }, [user_id, post_id, breeder_id]);

  const loadData = () => {
    ShowNotesFunction();
    fetchRatings();
    StatusLeadsBreederDetailsFunction();
  };

  const StatusLeadsBreederDetailsFunction = async () => {
    try {
      const payload = {
        user_id: user_id,
        post_id: post_id,
        breeder_id: breeder_id,
      };

      // Call the API and await the response
      const res = await StatusLeadsBreederDetails(payload);
      if (res?.data?.code === 200) {
        setPageData(res.data);

      } else {
        console.error("Error in response:", res);
      }
    } catch (error) {
      console.error("Error in StatusLeadsBreederDetailsFunction:", error);
    }
  };

  const ShowNotesFunction = async () => {
    const payload = {
      post_id: post_id,
      breeder_id: breeder_id,
    };
    const response = await ShowNotes(payload);
    if (response.data.code === 200) {
      setBreederShowNotes(response.data.data);
    }
  };

  const AddNotesSave = async () => {
    if (!addNotes || addNotes.trim() === "") {
      setErrors("Please fill the Notes field");
      return;
    }
  
    const payload = {
      user_id: user_id,
      post_id: post_id,
      breeder_id: breeder_id,
      notes: addNotes,
    };
  
    const response = await AddNotes(payload);
    if (response.data.code === 200) {
      setAddNotes(null);
      ShowNotesFunction();
    }
  };
  
  function handleViewMore (view) {
    router.push(`/user/posts/${view.user_id}/${view.post_id}/${view.pet_total_like}`)
    // if(isAuthenticated){
    //   router.push(`/user/posts/${slide.user_breeder_id}/${slide.id}/${slide.check_like}`)
    // } else{
    //   toast.error("User must be logged in");
    //   setTimeout(() => {
    //     router.push('/user/sign-in');
    //   }, 1000);
    // }
  }

  const handleUserStatusNotesLeadsUpdate = async (val) => {
    try {
      const payload = {
        user_id: user_id,
        post_id: post_id,
        status_leads: val,
        user_breeder_id: breeder_id,
      };

      const response = await StatusNotesLeadsUpdate(payload);
      

      if (response.data.code === 200) {
        toast.success("Status Update!");
      }
    } catch (error) {
      console.error("Error in handleUserStatusNotesLeadsUpdate:", error);
      // You can also set an error state or show an error message to the user here if needed.
    }
  };

  const fetchRatings = async () => {
    try {
      const payload = { breeder_id, post_id, user_id };
      const response = await GetRatting(payload);
      if (response.status === 200 && response.data.data.length > 0) {
        setRatings(response.data.data[0]);
      }
    } catch (error) {
      console.error("Error in fetchRatings:", error);
    }
  };

  const handleRatingClick = async (ratingType, newValue) => {
    try {
      const payload = { breeder_id, post_id, user_id, ...ratings, [ratingType]: newValue, };
      const response = await SetRatting(payload)
      if (response.status === 200) {
        setRatings((prev) => ({ ...prev, [ratingType]: newValue }));
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  return (
    <>
      <div className="contacted-breeder-wrap">
        <div className="container">
          <div className="col-lg-12">
            <div className="contacted-breeder-inner">
              <div className="col-lg-5 col-md-6">
                <div className="contacted-breeder-img">
                  <Image
                    src={
                      pageData.data?.[0].user_image
                        ? pageData.data?.[0].user_image
                        : "/images/Nextpet-imgs/Image_not_available.webp"
                    }
                    alt=""
                    width={444}
                    height={232}
                    loading="lazy" style={{border: "1px solid black"}}
                  />
                </div>
              </div>
              <div className="col-lg-7 col-md-6">
                <div className="contacted-breeder-content">
                  <h2>
                    {pageData.data?.[0].user_name
                      ? pageData.data?.[0].user_name
                      : "Name not Available"}
                  </h2>
                  <ul>
                    <li>
                      <Image
                        width={15}
                        height={15}
                        src="/images/Nextpet-imgs/contacted-imgs/location-icon.svg"
                        alt=""
                        loading="lazy"
                      />
                      &nbsp;
                      {pageData.data?.[0].user_address
                        ? pageData.data?.[0].user_address
                        : "Address Not Available"}
                    </li>
                    <li>
                      <Image
                        width={15}
                        height={15}
                        src="/images/Nextpet-imgs/contacted-imgs/mail.svg"
                        alt=""
                      />
                      &nbsp;
                      <Link href="#" style={{ textDecoration: "underline" }}>
                        {pageData.data?.[0].user_email
                          ? pageData.data?.[0].user_email
                          : "Email Not Available"}
                      </Link>
                    </li>
                    <li>
                      <Image
                        width={15}
                        height={15}
                        src="/images/Nextpet-imgs/contacted-imgs/phone.svg"
                        alt=""
                      />
                      &nbsp;
                      <a href="#">
                        {pageData.data?.[0].user_phone
                          ? `+1 ${pageData.data?.[0].user_phone}`
                          : "Not Available"}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="contacted-breeder-wrap">
        <div className="container">
          <div className="col-lg-12">
            <div className="contacted-breeder-inner">
              <div className="col-lg-5 col-md-6">
                <div className="contacted-breeder-img">
                  <Image
                     src={
                      pageData?.pet_breeder_details?.[0]?.image?.[0] || 
                      "/images/Nextpet-imgs/Image_not_available.webp"
                    }
                    alt=""
                    loading="lazy"
                    width={444}
                    height={232} style={{border: "1px solid black"}}
                  />
                </div>
              </div>
              <div className="col-lg-7 col-md-6">
                <div className="contacted-breeder-content">
                  <div className="contacted-heading">
                    <h3>Pet Info</h3>
                    <div className="heart-icon-wrap">
                      <Image
                        width={15}
                        height={15}
                        src={ pageData?.pet_breeder_details?.[0].total_like > 0 ? "/images/Nextpet-imgs/dashboard-imgs/heart-fill.svg" : "/images/Nextpet-imgs/dashboard-imgs/heart-border2.svg"}
                        alt=""
                        className="active"
                      />
                      <span  style={{left: '50%', transform: 'translateX(-50%)', textAlign: 'center'}}>
                        {pageData?.pet_breeder_details?.[0].total_like
                          ? pageData?.pet_breeder_details?.[0].total_like
                          : "0"}
                      </span>
                    </div>
                  </div>
                  <p>
                    {pageData?.data?.[0].pet_description
                      ? pageData?.data?.[0].pet_description
                      : "Description Not Available"}
                  </p>

                  <div className="viewmore-wrap">
                    <h4>
                      $
                      {pageData?.pet_breeder_details?.[0].price
                        ? pageData?.pet_breeder_details?.[0].price
                        : "Not Available"}
                    </h4>
                    <div className="action-wrap">
                      <a  onClick={() => handleViewMore(pageData.data[0])} style={{ cursor:'pointer'}}>
                        View More&nbsp;<i className="fas fa-angle-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="contacted-breeder-wrap">
        <div className="container">
          <div className="col-lg-12">
            <div className="contacted-breeder-inner">
              <div className="col-lg-12 col-md-12">
                <div className="experience-user-wrap">
                  <div className="experience-heading">
                    <h3>How was your experience with the User?</h3>
                    <div className="tooltip"  style={{position:'sticky',zIndex:'99999'}} >
                      <Image
                        width={15}
                        height={15}
                        src="/images/Nextpet-imgs/profile-page-imgs/i-icon.svg"
                        alt=""
                        loading="lazy"
                      />
                      <span className="tooltiptext">
                        <div className="tooltip-inner-content">
                          <h4>Adopted</h4>
                          <p>
                            Pet is not available because it has found a home.
                          </p>
                        </div>
                        <div className="tooltip-inner-content">
                          <h4>Lost</h4>
                          <p>You do not want to connect with this lead</p>
                        </div>
                        <div className="tooltip-inner-content">
                          <h4>Contacted</h4>
                          <p>You have connected to this lead.</p>
                        </div>
                        <div className="tooltip-inner-content">
                          <h4>Pending</h4>
                          <p>Lead is waiting for you to contact them.</p>
                        </div>
                      </span>
                    </div>
                  </div>

                  <div className="expreience-btn-ratingwrap">
                    <div className="inner-btns-rating">
                      <button type="button" value="Submit">
                        Politeness
                      </button>
                      <div className="star-ratings-coming">
                        <Rating rating={ratings.politeness_rating} onClick={(newValue) => handleRatingClick('politeness_rating', newValue)} />
                      </div>
                    </div>
                    <div className="inner-btns-rating">
                      <button type="button" value="Submit">
                        Responsive
                      </button>
                      <div className="star-ratings-coming">
                        <Rating rating={ratings.responsive_rating} onClick={(newValue) => handleRatingClick('responsive_rating', newValue)} />
                      </div>
                    </div>
                    <div className="inner-btns-rating">
                      <button type="button" value="Submit">
                        Communication
                      </button>
                      <div className="star-ratings-coming">
                        <Rating rating={ratings.communication_rating} onClick={(newValue) => handleRatingClick('communication_rating', newValue)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="contacted-breeder-wrap">
        <div className="container">
          <div className="col-lg-12">
            <div className="contacted-breeder-inner">
              <div className="col-lg-12 col-md-12">
                <div className="experience-user-wrap">
                  <div className="experience-heading">
                    <h3>What is the updated status of this pet post?</h3>
                    <div className="tooltip">
                      <Image
                        width={15}
                        height={15}
                        src="/images/Nextpet-imgs/profile-page-imgs/i-icon.svg"
                        alt=""
                        loading="lazy"
                      />
                      <span className="tooltiptext">
                        <p>Pet is not available because it has found a home.</p>
                      </span>
                    </div>
                  </div>

                  <div className="updatedstatus-btn-ratingwrap">
                    <div className="updatedstatus-btns-rating">
                      <button
                        type="button"
                        className="active"
                        onClick={() =>
                          handleUserStatusNotesLeadsUpdate("Adopted")
                        }
                        value="Submit"
                      >
                        Adopted
                      </button>
                    </div>
                    <div className="updatedstatus-btns-rating">
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleUserStatusNotesLeadsUpdate("Lost")}
                        value="Submit"
                      >
                        Lost
                      </button>
                    </div>
                    <div className="updatedstatus-btns-rating">
                      <button
                        type="button"
                        className="pending"
                        onClick={() =>
                          handleUserStatusNotesLeadsUpdate("Contacted")
                        }
                        value="Submit"
                      >
                        Contacted
                      </button>
                    </div>
                    <div className="updatedstatus-btns-rating">
                      <button
                        type="button"
                        className="warning"
                        onClick={() =>
                          handleUserStatusNotesLeadsUpdate("Pending")
                        }
                        value="Submit"
                      >
                        Pending
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="contacted-breeder-wrap">
        <div className="container">
          <div className="col-lg-12">
            <div className="contacted-breeder-inner">
              <div className="col-lg-12 col-md-12">
                <div className="experience-user-wrap">
                  <div className="experience-heading">
                    <h3>Notes</h3>
                  </div>

                  <label>
                    <textarea style={{border: errors ? '1px solid red' : ''}}
                      name=""
                      placeholder="You can add a personal memo here.."
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        if (value === "") {
                          setErrors("Fill the Notes field");
                          setAddNotes(null);
                        } else {
                          setErrors("");
                          setAddNotes(e.target.value);
                        }
                      }}
                    ></textarea>
                  </label>

                  <p>These notes are only visible to you.</p>
                  <p style={{color:'red'}}> {errors} </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="contucted-btn-wrap">
          <button type="button" value="Submit" onClick={AddNotesSave}>
            Add Note
          </button>
        </div>
      </div>

      <div className="contacted-breeder-wrap">
        <div className="container">
          <div className="col-lg-12">
            <div className="contacted-breeder-inner">
              <div className="col-lg-12 col-md-12">
                {showBreederNotes &&
                  showBreederNotes.map((note, index) => (
                    <div key={index}>
                      <div className="experience-user-wrap">
                        <div className="calender-warp">
                          <span style={{minWidth:'100px'}}>
                            {note.date && moment(note.date).format("MMMM DD")}
                          </span>
                          <p>{note.notes ? note.notes : ""}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


const Rating = ({ rating, onClick }) => {
  return (
      <div style={{ display: 'flex', gap: '10px' }}>
          {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} onClick={() => onClick(value)}
                  style={{ all: 'unset', fontSize:'30px' }} >
                    {value <= rating ? <FaStar style={{ cursor: 'pointer',color:'#f2ae0e'}}/> : <FaStar style={{cursor: 'pointer',color:'gray'}} />} 
              </button>
          ))}
      </div>
  );
};

export default Contacted;
