"use client";
import { React, useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import BASE_URL from "../../../../../../utils/constant";
import Carousel from "../../../../../../../components/Carousel.js";
import { useParams, useRouter } from "next/navigation";
import { PostDetail } from "../../../../../../services/user/post";
import ContactModal from "../../../../../../../components/ContactModal";
import PreviouslyContacted from "../../../../../../../components/PreviouslyContacted";
import { CustomPlaceholder } from "react-placeholder-image";
import { useAuth } from "@/src/app/context/AuthContext";
import { toast } from "react-toastify";
import moment from "moment";
// import ProtectedRoute from "../../../../../../context/ProtectedRoute";
const ContactPetDetails = () => {
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreviousModal, setShowPreviousModal] = useState(false);
  const { postId } = useParams();
  const [previousPostImage, setPreviousPostImage] = useState([]);
  const [postData, setPostData] = useState("");
  const [modalData, setModalData] = useState({
    post_id: "",
    // breeder_id: "",
  });
  const { isAuthenticated } = useAuth(); 
  const router = useRouter();


  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("user_user_id");
      setUserId(storedUserId);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      PostDetailGet();
    }
    PostDetailGet();
  }, [userId]);
  
  const PostDetailGet = async () => {
    const payload = {
      user_id: userId || null, // Send null if userId doesn't exist
      id: postId,
    };
  
    try {
      const response = await PostDetail(payload);
      if (response.data.code === 200) {
        setPostData(response.data.data[0]);
        setPreviousPostImage(response.data.data[0].image);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };
  

  const handlePostLike = async () => {
    if(isAuthenticated){
      let checkLikeDislike = postData?.check_like == "0" ? 1 : 111;
      let likeData = {
        user_id: userId,
        post_id: postData?.post_id || "",
        breeder_id: postData?.post_id || "",
        like_post: checkLikeDislike,
      };

      try {
        const response = await axios.post(`${BASE_URL}/api/like_post`, likeData);
        if (response.data.code === 200) {
          PostDetailGet();
        }
      } catch (err) {
        console.error("error : ", err);
      }
    } else{
      toast.error("User must be logged in");
      setTimeout(() => {
        router.push('/user/sign-in');
      }, 1000);
    }
  };


    const handleModal = ({
      post_id = postData?.post_id,
      breeder_id = postData?.user_id,
      contacts_colour = postData?.contacts_colour,
    } = {}) => {
      const modalData = {
        post_id,
        breeder_id,
        contacts_colour,
        date_contacts_breeder: postData?.total_contact,
      };
      setModalData(modalData);
      if (contacts_colour == 1) {
        setShowPreviousModal(true);
      } else {
        setShowModal(true);
      }
    };

  function sethandleData () {
    if(isAuthenticated){
      handleModal()
    } else {
      toast.error("User must be logged in");
      setTimeout(() => {
        router.push('/user/sign-in');
      }, 1000);
    }
  }
  const closeModal = () => {
    PostDetailGet();
    setShowModal(false);
    setShowPreviousModal(false);
  };
  
  const getFullUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href; // Returns full URL
    }
    return '';
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.clipboard.writeText( getFullUrl());
        // Use the Web Share API to share content (for mobile devices)
        await navigator.share({
          title: 'Breeder Details',
          url: getFullUrl(),
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText( getFullUrl());
    }
  };


  return (
    // <ProtectedRoute>
    <>
      <div className="breedeerdasboard-createpost-wrap">
        <div className="container">
          <div className="col-lg-12">
            <div className="breedeerdasboard-createpost-inner">
              <div className="breedeerdasboard-createpost-left">
                {previousPostImage.length > 0 ? (
                  <Carousel previousPostImage={previousPostImage} />
                ) : (
                  <CustomPlaceholder
                    width={250}
                    height={250}
                    text="Not available"
                    alt="Image not available"
                  />
                )}
              </div>
              <div className="breedeerdasboard-createpost-right">
                <div className="postcreate-heading">
                  <h3>{postData?.name}</h3>
                  <div className="edit-heartpost">
                    <div className="inner-heartt" onClick={sethandleData}>
                      <div className="inner-heartt-div">
                        <Image
                          src={
                            postData?.contacts_colour == "1"
                              ? "/images/Nextpet-imgs/newyear-cats-imgs/mail.svg"
                              : "/images/Nextpet-imgs/dashboard-imgs/yellow-mail-letter.svg"
                          }
                          alt=""
                          width={37}
                          height={31}
                        />
                      </div>
                      {postData?.total_contact && postData?.total_contact}
                    </div>
                    <div className="inner-heartt" onClick={handlePostLike}>
                      <div className="inner-heartt-div">
                        <Image
                          src={
                            (postData?.check_like == "0")
                              ? "/images/Nextpet-imgs/dashboard-imgs/heart-border2.svg"
                              : "/images/Nextpet-imgs/dashboard-imgs/heart-fill.svg"
                          }
                          alt=""
                          width={39}
                          height={39}
                        />
                      </div>
                      {postData?.total_like && postData?.total_like}
                    </div>
                    <div className="inner-heartt"  style={{ padding: "7px 4px", borderRadius:'100%' }}>
                      <div className="inner-heartt-div" onClick={handleShare}>
                        <Image
                          src="/images/Nextpet-imgs/dashboard-imgs/share.svg"
                          alt=""
                          width={37}
                          height={31}/>
                      </div>
                        
                    </div>
                  </div>
                </div>
                <form>
                  <label>
                    <p>{postData.description ? postData.description : ""}</p>
                  </label>
                  <h4> About {postData?.name ? postData.name : ""}</h4>
                  <div className="list-post-form">
                    <div className="formdata-wrap">
                      <p>Type</p>
                      <input
                        type="text"
                        value={postData.type ? postData.type : ""}
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="formdata-wrap">
                      <p>Breed</p>
                      <input
                        type="text"
                        value={postData.breed ? postData.breed : ""}
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="formdata-wrap">
                      <p>Price</p>
                      <input
                        type="text"
                        value={postData.price ? postData.price : ""}
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="formdata-wrap">
                      <p>General Size</p>
                      <input
                        type="text"
                        value={postData.size ? postData.size : ""}
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="formdata-wrap">
                      <p>Anticipated Weight (lbs)</p>
                      <input
                        type="text"
                        value={postData.weight ? postData.weight : ""}
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="formdata-wrap">
                      <p>Gender</p>
                      <input
                        type="text"
                        value={
                          postData.animal_gender
                            ? postData.animal_gender
                            : "Null"
                        }
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="formdata-wrap">
                      <p>Birthdate</p>
                      <input
                        type="text"
                        value={postData.birthdate ? moment(postData.birthdate).format("MM/DD/YYYY") : ""}
                        id="datepicker"
                        placeholder=""
                        disabled
                      /> 
                    </div>

                    <div className="formdata-wrap">
                      <p>Date Available</p>
                      <input
                        type="text"
                        value={postData.avialable ? moment(postData.avialable).format("MM/DD/YYYY") : ""}
                        id="datepicker2"
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="formdata-wrap">
                      <p>Health guarantee</p>
                      <input
                        type="text"
                        value={postData.health == 1 ? "Yes" : "No"}
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="formdata-wrap">
                      <p>Certifications</p>
                      <input
                        type="text"
                        value={
                          postData.certification ? postData.certification : ""
                        }
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="formdata-wrap">
                      <p>Delivery availability</p>
                      <input
                        type="text"
                        value={postData.delivery == 1 ? "Yes" : "No"}
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="formdata-wrap">
                      <p>Boarding availability</p>
                      <input
                        type="text"
                        value={postData.boarding == 1 ? "Yes" : "No"}
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="formdata-wrap">
                      <p>Flying availability</p>
                      <input
                        type="text"
                        value={postData.flying == 1 ? "Yes" : "No"}
                        placeholder=""
                        disabled
                      />
                    </div>

                    <div className="posts-btn-wrap">
                      {/* <a
                        href="#"
                        onClick={handleModal}
                        style={{ cursor: "pointer" }}
                      >
                        Contact Breeder
                      </a> */}
                      <button type="button" onClick={sethandleData}  data-bs-target="#breeder-guide2" data-bs-toggle="modal">Contact
                      Breeder</button>
                    </div>
                  </div>
                </form>

                {/* <div
                  className="modal fade"
                  id="breeder-guide2"
                  tabindex="-1"
                  role="dialog"
                  aria-labelledby="myModalLabel"
                >
                  <div
                    className="modal-dialog modal-dialog-edit"
                    role="document"
                  >
                    <div className="modal-content">
                      <div className="modal-heading">
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body">
                        <form action="">
                          <div className="breederform-popup-wrap">
                            <img
                              src="/images/Nextpet-imgs/envelope.svg"
                              alt=""
                            />
                            <h1 className="pt-4">Contact Breeder</h1>
                            <p>
                              You are going to contact the breeder of this post.
                              In doing so, your contact information will be
                              shared to the breeder.
                            </p>
                            <h4>
                              Hurry up! 21 users have already contacted the
                              breeder for this pet.
                            </h4>
                            <div className="agreed-wrap">
                              <input type="checkbox" />
                              <span>Do not show me this message again.</span>
                            </div>
                            <div className="userpopup-btn-wrap">
                              <button
                                type="button"
                                className="inactive"
                                value="Submit"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              >
                                Not Yet
                              </button>
                              <button
                                type="button"
                                value="Submit"
                                data-bs-target="#breeder-information-user"
                                data-bs-toggle="modal"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              >
                                Contact Breeder
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
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
    {/* </ProtectedRoute> */}
    </>
  );
};

export default ContactPetDetails;
