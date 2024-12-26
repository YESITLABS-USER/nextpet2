"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import Select from "react-select";
import Image from "next/image";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import BASE_URL from "../../../../utils/constant";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const CreatePost = () => {
  // const breederUserId = localStorage.getItem("breeder_user_id");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animalTypes, setAnimalTypes] = useState([]);
  const [animalBreeds, setAnimalBreeds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState({ latitude: 36.778259, longitude: -119.417931 }); // default latitude and longitude of california
  const [healthGuarantee, setHealthGuarantee] = useState(false);
  const [deliveryAvailability, setDeliveryAvailability] = useState(0);
  const [boardingAvailability, setBoardingAvailability] = useState(false);
  const [flyingAvailability, setFlyingAvailability] = useState(false);
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [errorAdditionalRequest, setErrorsAdditionalRequest] = useState(null);
  const [breederUserId, setBreederUserId] = useState(null);
  const [countDetail, setCountDetail] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBreederUserId(localStorage.getItem("breeder_user_id"));
    }
  }, []);

  useEffect(() => {
    const fetchPostCount = async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/post_count`, {
          user_breeder_id: breederUserId,
        });
   
        if (response.data.code === 200) {
          setCountDetail(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching post count:", error);
      }
    };
  
    if (breederUserId) {
      fetchPostCount();
    }
  }, [breederUserId]);
  
  // console.log("deliveryAvailability", deliveryAvailability);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const handlePostImage = (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    if (files.length > 10) {
      setImageError("Error: You can only add up to 10 images.");
      return;
    }
    setImageError("");
    const imagesArray = Array.from(files).map((file) => file);
    setImages((prevImages) => [...prevImages, ...imagesArray]);
  };

  const fetchAnimalTypes = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/additional_request_web`
      );
      const animalData = response.data.data.map((item) => item.animal);
      const formattedAnimalTypes = animalData.map((animal) => ({
        value: animal.toLowerCase().replace(/\s+/g, "_"),
        label: animal,
      }));
      formattedAnimalTypes.push({ value: "other", label: "Other" });
      setAnimalTypes(formattedAnimalTypes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimalTypes();
  }, []);

  const handleSelectedAnimalTypesChange = async (
    selectedOption,
    setFieldValue
  ) => {
    setFieldValue("animalType", selectedOption.value);
    if (selectedOption.value === "other") {
      setShowModal(true);
    } else {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/additional_request_web`
        );
        const formattedBreedTypes = response.data.data
          .find((item) => item.animal === selectedOption.label)
          .sub[0].breed_type.map((item) => ({
            value: item,
            label: item,
          }));
        setAnimalBreeds(formattedBreedTypes);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const submitAdditionalRequest = async (e) => {
    e.preventDefault();

    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
    if (!additionalRequestAnimalType || !additionalRequestBreedType) {
      setErrorsAdditionalRequest("Both fields are required.");
      return;
    }
    if (
      specialCharPattern.test(additionalRequestAnimalType) ||
      specialCharPattern.test(additionalRequestBreedType)
    ) {
      setErrorsAdditionalRequest("Special characters are not allowed.");
      return;
    }

    setErrorsAdditionalRequest("");
    const formData = new FormData();
    formData.append("breeders_id", breederUserId);
    formData.append("animal", additionalRequestAnimalType);
    formData.append("breed_type[]", additionalRequestBreedType);

    try {
      await axios.post(
        `${BASE_URL}/api/additional_breeder_add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log("Response: ", response);
      toast.success("Your request has been submitted");
      closeModal();
    } catch (error) {
      console.error("Error submitting request: ", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const initialValues = {
    petname: "",
    description: "",
    price: "",
    size: "",
    animalGender: "",
    weight: "",
    birthdate: "",
    date_avialable: "",
    animalType: "",
    type: "",
    breed: "",
    certification: "",
    deliveryAvailability: "",
  };

  const validationSchema = Yup.object({
    petname: Yup.string().required("Pet name is required"),
    description: Yup.string().test(
      'min-words',
      'Description must be at least 20 words',
      (value) => {
        if (!value) return false;
        const wordCount = value.trim().split(/\s+/).length;
        return wordCount >= 20;
      }
    )
    .required('Description is required'),
    price: Yup.number()
      .required("Price is required")
      .typeError("Price must be a number"),
    size: Yup.string().required("Size is required"),
    animalGender: Yup.string().required("Gender is required"),
    weight: Yup.number()
      .required("Weight is required")
      .positive("Weight must be positive"),
    birthdate: Yup.date().required("Birthdate is required"),
    date_avialable: Yup.date().required("Date Available is required"),
    animalType: Yup.string().required("Animal type is required"),
    certification: Yup.string().required("Certification is required"),
    breed: Yup.string().required("Breed type is required"),
    // deliveryAvailability: Yup.number().required(
    //   "Delivery availability is required"
    // ),
  });

  const submitPostForm = async (values) => {
    const formData = new FormData();
    formData.append("health_guarantee", healthGuarantee ? 1 : 0);
    formData.append("delivery_availability", deliveryAvailability ? 1 : 0);
    formData.append("boarding_availability", boardingAvailability ? 1 : 0);
    formData.append("flying_availability", flyingAvailability ? 1 : 0);
    formData.append("petname", values.petname);
    formData.append("description", values.description);
    formData.append("animal_type_id", values.animalType);
    formData.append("type", values.type);
    formData.append("breed", values.breed.toLowerCase());
    formData.append("price", values.price);
    formData.append("animal_gender", values.animalGender);
    formData.append("size", values.size);
    formData.append("weight", values.weight);
    formData.append("birthdate", values.birthdate);
    formData.append("date_avialable", values.date_avialable);
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);
    formData.append("user_id", breederUserId);
    formData.append("certification", values.certification);

    images.forEach((img) => {
      formData.append("image[]", img);
    });

    try {
      const response = await axios.post(
        `${BASE_URL}/api/post_breed`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if(response.data.code === 400) {
        toast.error(response.data.msg);
        return;
      }
      if(response.data.code === 200){
        toast.success('Post Created Successfully');
        router.push('/breeder/posts')
      }
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="breedeerdasboard-createpost-wrap">
      <div className="container">
        <div className="col-lg-12">
          <div className="breedeerdasboard-createpost-inner">
            <div className="breedeerdasboard-createpost-left">
              <div className="create-uploadpost-wrap">
                <div className="edit-post-icon">
                  <a href="#">
                    <Image
                      src="/images/Nextpet-imgs/dashboard-imgs/edit-post-icon.svg"
                      alt="edit-post-icon"
                      width={22}
                      height={20}
                    />
                  </a>
                </div>
                <label className="add-icon-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePostImage}
                    multiple
                  />
                  <Image
                    src="/images/Nextpet-imgs/dashboard-imgs/createpost-upload-icon.png"
                    alt="createpost-upload-icon"
                    width={44}
                    height={44}
                  />
                  <p>
                    Add pet images here
                    <br />
                    (Size Up to 5Mb)
                  </p>
                </label>
              </div>
              {imageError && <p style={{ color: "red" }}>{imageError}</p>}
            </div>
            <div className="breedeerdasboard-createpost-right">
              <div className="postcreate-heading">
                <h3>Pet name</h3>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={submitPostForm}
              >
                {({ setFieldValue }) => (
                  <Form>
                    <label>
                      <Field
                        as="textarea"
                        name="description"
                        placeholder="Enter pet description here..."
                      />
                      <ErrorMessage
                        name="description"
                        component="div"
                        style={{ color: "red" }}
                      />
                    </label>
                    <h4>About Pet-name </h4>
                    <div className="list-post-form">
                      <div className="formdata-wrap">
                        <p>Name </p>
                        <Field type="text" name="petname" />
                        <ErrorMessage className="ErrorMessage"
                          name="petname"
                          component="div"
                          style={{ color: "red" }}
                        />
                      </div>

                      <div className="formdata-wrap">
                        <p>Type</p>
                          <Select
                            options={animalTypes}
                            styles={{
                              container: (provided) => ({
                                ...provided,
                                width: 250,
                              }),
                              control: (provided) => ({
                                ...provided,
                                width: 250,
                                backgroundColor: "transparent",
                                border: "none",
                              }),
                            }}
                            onChange={(selectedOption) =>
                            {handleSelectedAnimalTypesChange(
                                selectedOption, setFieldValue ); setFieldValue("type", selectedOption.value)}
                              
                            }
                          />
                          <ErrorMessage className="ErrorMessage"
                            name="animalType"
                            component="div"
                            style={{ color: "red" }}
                          />
                        
                      </div>

                      <div className="formdata-wrap">
                        <p>Breed</p>
                        <Select
                          options={animalBreeds}
                          styles={{
                            container: (provided) => ({
                              ...provided,
                              width: 250,
                            }),
                            control: (provided) => ({
                              ...provided,
                              width: 250,
                              backgroundColor: "transparent",
                              border: "none",
                            }),
                          }}
                          onChange={(selectedOption) => {
                            setFieldValue("breed", selectedOption.value)
                          }
                          }
                        />
                        <ErrorMessage className="ErrorMessage"
                          name="breed"
                          component="div"
                          style={{ color: "red" }}
                        />
                      </div>

                      <div className="formdata-wrap">
                        <p>Price ($)</p>
                        <Field type="text" name="price" />
                        <ErrorMessage className="ErrorMessage"
                          name="price"
                          component="div"
                          style={{ color: "red" }}
                        />
                      </div>

                      <div className="formdata-wrap">
                        <p>General Size</p>
                        <Field as="select" name="size">
                          <option value="">Select size</option>
                          <option value="Standard">Standard</option>
                          <option value="Mini">Mini</option>
                          <option value="Micro">Micro</option>
                        </Field>
                        <ErrorMessage className="ErrorMessage"
                          name="size"
                          component="div"
                          style={{ color: "red" }}
                        />
                      </div>

                      <div className="formdata-wrap">
                        <p>Animal Gender</p>
                        <Field as="select" name="animalGender">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </Field>
                        <ErrorMessage className="ErrorMessage"
                          name="animalGender"
                          component="div"
                          style={{ color: "red" }}
                        />
                      </div>

                      <div className="formdata-wrap">
                        <p>Anticipated Weight (lbs)</p>
                        <Field type="text" name="weight" />
                        <ErrorMessage className="ErrorMessage"
                          name="weight"
                          component="div"
                          style={{ color: "red" }}
                        />
                      </div>

                      {/* <div className="formdata-wrap">
                        <p>Birthdate</p>
                        <Field type="date" name="birthdate" />

                        <ErrorMessage className="ErrorMessage"
                          name="birthdate"
                          component="div"
                          style={{ color: "red" }}
                        />
                      </div>

                      <div className="formdata-wrap">
                        <p>Date Available</p>
                        <Field type="date" name="date_avialable" />
                        <ErrorMessage className="ErrorMessage"
                          name="date_avialable"
                          component="div"
                          style={{ color: "red" }}
                        />
                      </div> */}

                        <DateField name="birthdate" label="Birthdate" />
                        <DateField name="date_avialable" label="Date Available" />

                      <div className="formdata-wrap">
                        <p>Health guarantee</p>
                        <div className="switch-toggle switch-3 switch-candy">
                          <input
                            id="health-guarantee-yes"
                            type="radio"
                            checked={healthGuarantee}
                            onChange={() => setHealthGuarantee(true)}
                          />
                          <label htmlFor="health-guarantee-yes">YES</label>
                          <input
                            id="health-guarantee-no"
                            type="radio"
                            checked={!healthGuarantee}
                            onChange={() => setHealthGuarantee(false)}
                          />
                          <label htmlFor="health-guarantee-no">NO</label>
                        </div>
                      </div>
                      <div className="formdata-wrap">
                        <p>Certifications</p>
                        <Field type="text" name="certification" />
                        <ErrorMessage className="ErrorMessage"
                          name="certification"
                          component="div"
                          style={{ color: "red" }}
                        />
                      </div>
                      <div className="formdata-wrap">
                        <p>Delivery availability</p>
                        <div className="switch-toggle switch-3 switch-candy">
                          <input
                            id="delivery-yes"
                            type="radio"
                            checked={deliveryAvailability}
                            onChange={() => setDeliveryAvailability(1)}
                          />
                          <label htmlFor="delivery-yes">YES</label>
                          <input
                            id="delivery-no"
                            type="radio"
                            checked={!deliveryAvailability}
                            onChange={() => setDeliveryAvailability(0)}
                          />
                          <label htmlFor="delivery-no">NO</label>
                        </div>
                        <ErrorMessage className="ErrorMessage"
                          name="deliveryAvailability"
                          component="div"
                          style={{ color: "red" }}
                        />
                      </div>

                      <div className="formdata-wrap">
                        <p>Boarding availability</p>
                        <div className="switch-toggle switch-3 switch-candy">
                          <input
                            id="boarding-yes"
                            type="radio"
                            checked={boardingAvailability}
                            onChange={() => setBoardingAvailability(true)}
                          />
                          <label htmlFor="boarding-yes">YES</label>
                          <input
                            id="boarding-no"
                            type="radio"
                            checked={!boardingAvailability}
                            onChange={() => setBoardingAvailability(false)}
                          />
                          <label htmlFor="boarding-no">NO</label>
                        </div>
                      </div>

                      <div className="formdata-wrap">
                        <p>Flying availability</p>
                        <div className="switch-toggle switch-3 switch-candy">
                          <input
                            id="flying-yes"
                            type="radio"
                            checked={flyingAvailability}
                            onChange={() => setFlyingAvailability(true)}
                          />
                          <label htmlFor="flying-yes">YES</label>
                          <input
                            id="flying-no"
                            type="radio"
                            checked={!flyingAvailability}
                            onChange={() => setFlyingAvailability(false)}
                          />
                          <label htmlFor="flying-no">NO</label>
                        </div>
                      </div>

                      <div className="posts-btn-wrap">
                        <button type="submit">Post a Pet</button>
                          {countDetail && <p> {countDetail?.breeder_post} out of {countDetail?.total_post} posts remaining</p>}
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
        style={{
          content: {
            width: "400px",
            height: "300px",
            margin: "auto",
            borderRadius: "30px",
            position: "relative",
            top: showModal ? "50px" : "0",
            transition: "top 0.5s ease-in-out, opacity 0.5s ease-in-out",
            opacity: showModal ? "1" : "0",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            overflow: "hidden",
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
          },
        }}
        onAfterOpen={() => {
          document.body.style.overflow = "hidden";
        }}
        onAfterClose={() => {
          document.body.style.overflow = "auto";
        }}
      >
        <div className="modal-body">
          <form onSubmit={submitAdditionalRequest}>
            <div className="conatctcpach-popup-wrap">
              <h1>Additional Request</h1>
              <div className="coach-form-wrap">
                {errorAdditionalRequest && (
                  <spam style={{ color: "red" }}>{errorAdditionalRequest}</spam>
                )}
                <input
                  type="text"
                  placeholder="Animal type"
                  onChange={(e) =>
                    setAdditionalRequestAnimalType(e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Breed type"
                  onChange={(e) =>
                    setAdditionalRequestBreedType(e.target.value)
                  }
                />
                <div className="d-flex justify-content-center">
                  <button type="submit" value="Submit" data-bs-dismiss="close">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default CreatePost;

import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useFormikContext } from "formik";

const DateField = ({ name, label }) => {
  const { setFieldValue } = useFormikContext();
  
  // Handle the date format change on display and submission
  const handleDateChange = (date) => {
    setFieldValue(name, date ? date.toISOString().split("T")[0] : "");
  };

  return (
    <div className="formdata-wrap">
      <p>{label}</p>
      <Field name={name}>
        {({ field }) => (
          <ReactDatePicker
            selected={field.value ? new Date(field.value) : null}
            onChange={handleDateChange}
            dateFormat="MM-dd-yyyy" 
            placeholderText="MM-dd-yyyy"
            className="form-control"
          />
        )}
      </Field>
      <ErrorMessage
        className="ErrorMessage"
        name={name}
        component="div"
        style={{ color: "red" }}
      />
    </div>
  );
};