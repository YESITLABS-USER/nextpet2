"use client";
import UserProfileLeft from "../../../components/UserProfileLeft";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../utils/constant";
import Modal from "react-modal";
import { toast } from "react-toastify";
import Link from "next/link";
import ProtectedRoute from "../../context/ProtectedRoute";
import GooglePlacesAutocomplete from '../../../components/GooglePlacesAutocomplete'

const Alert = () => {
  const [userId, setUserId] = useState(null);
  const [rangeValue, setRangeValue] = useState(200);
  const [animalTypes, setAnimalTypes] = useState([]);
  const [animal_type_id, setAnimalTypeId] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [breed, setBreed] = useState(null);
  const [address, setAddress] = useState(null);
  const [latitude, setLatitude] = useState(35.1258);
  const [longitude, setLongitude] = useState(17.9859);
  const [showLogOut, setShowModal] = useState(false);
  const [additionalRequestWeb, setAdditionalRequestWeb] = useState([]);
  const [breeds_typss, setBreedTypeInOption] = useState({ breed_type: [] });
  const [edit, setEdit] = useState(false);

  const handleLocationSelect = (lat, lng, address) => {
    setLatitude(lat || '35.1258');
    setLongitude(lng || '17.9859');
    setAddress(address);
  };

  const customStyles = {
    content: {
      top: "0%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, 0%)",
      borderRadius: "15px",
      transition: "transform 0.5s ease-out",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  let animalData = "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("user_user_id");
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    const additionalRequest = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/additional_request_web`
        );

        if (response.data.code === 200) {
          setAdditionalRequestWeb(response.data.data);
        }

        animalData = response.data.data.map((item) => item.animal);
        const formattedAnimalTypes = animalData.map((animal) => ({
          value: animal.toLowerCase().replace(/\s+/g, "_"),
          label: animal,
        }));

        setAnimalTypes(formattedAnimalTypes);
      } catch (err) {
        console.error("error : ", err);
      }
    };

    const setAlertsGet = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/set_alerts_get`,
          { user_id: userId },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.code === 200) {
          let data = response.data.data;
          setRangeValue(data.search_radius);
          setAddress(data.address);
          setSelectedAnimal(data.animal_type);
          setBreed(data.breed_type);
          setAnimalTypeId(data.animal_type_id);
        }
      } catch (err) {
        console.error("error : ", err);
      }
    };

    // if ("geolocation" in navigator) {
    //   navigator.geolocation.getCurrentPosition(({ coords }) => {
    //     const { latitude, longitude } = coords;
    //     setLatitude(latitude);
    //     setLongitude(longitude);
    //   });
    // } else {
    //   setLatitude(35.1258);
    //   setLongitude(17.9859);
    // }
    setAlertsGet();
    additionalRequest();
  }, [userId]);

  const handleChangeAnimalType = async (selectedOption) => {
    setSelectedAnimal(selectedOption.target.value);
    const selected_typeAnimal = animalTypes.find(
      (animal) => animal.value === selectedOption.target.value
    );
    const breeds_typ = additionalRequestWeb.filter(
      (item) => item.animal === selected_typeAnimal.label
    );
    if (breeds_typ.length > 0) {
      setBreedTypeInOption(breeds_typ[0].sub[0]);
    } else {
      setBreedTypeInOption({ breed_type: [] });
    }
  };

  const handleRangeChange = (event) => {
    setRangeValue(event.target.value);
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (selectedAnimal == null) {
      toast.error("Animal Type is required!");
      return;
    }
    if (breed == null) {
      toast.error("Breed Type is required!");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/set_alerts`,
        {
          user_id: userId,
          animal_type_id: animal_type_id,
          animal_type: selectedAnimal,
          breed_type: breed,
          address: address,
          latitude: latitude,
          longitude: longitude,
          search_radius: rangeValue,
          alert_status: 1,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.code === 200) {
        setShowModal(true);
      } else {
        toast.error("Network Error, Try After Some Time!");
      }
    } catch (error) {
      toast.error("Network Error, Try After Some Time");
    }
  };

  function closeModal() {
    setShowModal(false);
    setEdit(false);
  }

  const userPages = {
    page: "alert",
  };

  return (
    <>
      <ProtectedRoute>
        <div className="breedeerdasboard-profile-wrap">
          <div className="container">
            <div className="col-lg-12">
              <div className="breedeerdasboard-profile-inner">
                <UserProfileLeft userPages={userPages} />

                <div className="breedeerdasboard-profile-right">
                  <div className="profile-pic-wrap">
                    <form onSubmit={submitForm}>
                      {!edit && (
                        <div className="edit-profile-icon">
                          <Link href="#" onClick={() => setEdit(true)}>
                            <Image
                              src="/images/Nextpet-imgs/dashboard-imgs/edit-profile-icon.svg"
                              alt="Edit Profile"
                              width={50}
                              height={50}
                            />
                          </Link>
                        </div>
                      )}

                      <h1>Alerts</h1>
                      <div className="alert-form-wrap">
                        <div className="alert-plans-wp">
                          <div className="alert-heading">
                            <h3>Set Alerts</h3>
                            <div className="tooltip" style={{ zIndex: 1 }}>
                              <Image
                                src="/images/Nextpet-imgs/profile-page-imgs/i-icon.svg"
                                alt=""
                                width={0}
                                height={0}
                              />
                              <span className="tooltiptext">
                                Add an alert to receive a notification when
                                there is a pet available that matches your set
                                preferences below.
                              </span>
                            </div>
                          </div>
                        </div>
                        <label htmlFor="">
                          <select
                            name="animal"
                            value={selectedAnimal}
                            id=""
                            onChange={handleChangeAnimalType}
                            disabled={!edit}
                          >
                            <option disabled>Select animal Type</option>
                            {animalTypes.map((animal, index) => {
                              return (
                                <option key={index} value={animal.value}>
                                  {animal.label}
                                </option>
                              );
                            })}
                          </select>
                        </label>
                        <label htmlFor="">
                          <select
                            name="breed"
                            id=""
                            value={breed}
                            onChange={(e) => setBreed(e.target.value)}
                            disabled={!edit}
                          >
                            <option>Select Breed Type</option>
                            {breeds_typss.breed_type &&
                            breeds_typss.breed_type.length > 0 ? (
                              breeds_typss.breed_type.map((breed, index) => (
                                <option key={index} value={breed}>
                                  {breed}
                                </option>
                              ))
                            ) : breed ? (
                              <option value={breed}>{breed}</option>
                            ) : (
                              <option disabled>No breeds available</option>
                            )}
                          </select>

                          {/* {console.log(animalTypes,"asdfghjkl")} */}
                        </label>
                        <div className="alert-plans-wp">
                          <div className="alert-heading">
                            <h3>Location</h3>
                            <div className="tooltip" style={{ zIndex: 1 }}>
                              <Image
                                src="/images/Nextpet-imgs/profile-page-imgs/i-icon.svg"
                                alt=""
                                width={0}
                                height={0}
                              />
                              <span className="tooltiptext">
                                Add an alert to receive a notification when
                                there is a pet available that matches your set
                                preferences below.
                              </span>
                            </div>
                          </div>
                        </div>
                        <label htmlFor="">
                          {/* <input
                            type="text"
                            placeholder="Enter location"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            disabled={!edit}
                          /> */}
                          <GooglePlacesAutocomplete onLocationSelect={handleLocationSelect} edit={edit} getAddress={address} />                          
                          <img
                            src="/images/Nextpet-imgs/all-icons/location.svg"
                            className="location-set"
                            alt=""
                          />
                        </label>

                        <div className="alert-plans-wp">
                          <div className="alert-heading">
                            <h3>Search Radius</h3>
                          </div>
                          <label>
                            <div className="range-slider">
                              <p
                                style={{
                                  position: "absolute",
                                  left: `${(rangeValue / 800) * 100}%`,
                                  transform: "translateX(-50%)",
                                  top: "-30px",
                                }}
                              >
                                {rangeValue} miles
                              </p>
                              <input
                                id="range"
                                type="range"
                                step="10"
                                value={rangeValue}
                                min="0"
                                max="800"
                                onChange={handleRangeChange} // Handle change event
                                disabled={!edit}
                              />
                            </div>
                          </label>
                        </div>

                        {edit && (
                          <div className="alert-btn-wrap">
                            <button
                              type="submit"
                              value="Submit"
                              data-bs-target="#alert-success"
                              data-bs-toggle="modal"
                            >
                              Add Alerts
                            </button>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- ALERT SUCESS-POPUP --> */}
        <Modal
          isOpen={showLogOut}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Logout Modal"
          onAfterOpen={() => {
            // Apply animation when modal opens
            document.querySelector(".ReactModal__Content").style.transform =
              "translate(-50%, 20%)";
          }}
        >
          <div className="modal-dialog modal-dialog-edit" role="document">
            <div className="modal-content">
              <div className="modal-heading">
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form action="">
                  <div className="profileverify-popup-wrap">
                    <img
                      src="/images/Nextpet-imgs/breeder-signin-imgs/congratu-icon.svg"
                      alt=""
                    />
                    <h1>Success!</h1>
                    <p>
                      Your alerts has been changed <br />
                      successfully.
                    </p>
                    <div className="delete-account-btns">
                      <button
                        type="button"
                        value="Submit"
                        data-bs-toggle="modal"
                        data-bs-dismiss="close"
                        onClick={closeModal}
                      >
                        Okay
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Modal>
      </ProtectedRoute>
    </>
  );
};

export default Alert;
