"use client";
import React, { useState, useEffect } from "react";
import BASE_URL from "../../../utils/constant";
import Image from "next/image";
import axios from "axios";
import BreederProfileLeft from "../../../../components/BreederProfileLeft";
import { FaStar } from "react-icons/fa";
import { GoClock } from "react-icons/go";
import { MdNavigateNext } from "react-icons/md";
import Pagination from "../../../../components/Pagination";
import Link from "next/link";
import BreederProtectedRoute from "@/src/app/context/BreederProtectedRoute";

const Leads = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [leadsData, setLeadsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(8);
  const [checkedValues, setCheckedValues] = useState({
    All: true,
    Pending: false,
    Shortlisted: false,
    Archived: false,
    Adopted: false,
  });

  const breederData = {
    page: "leads",
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    let user = {
      breeder_id: localStorage.getItem("breeder_user_id"),
    };
    try {
      const response = await axios.post(
        `${BASE_URL}/api/status_leads_breeder`,
        user
      );
      if (response.data.status_code === 200) {
        const filteredData = response.data.data.filter((item) => item.pet_name !== null);
        setLeadsData(filteredData);
      }
      
    } catch (err) {
      console.error("error : ", err);
    }
  };

  const fillterLeads = async (filters) => {
    let user = {
      breeder_id: localStorage.getItem("breeder_user_id"),
      search: [filters],
    };
    try {
      const response = await axios.post(
        `${BASE_URL}/api/status_leads_breeder_filter`,
        user
      );

      if(response.data.status_code ===400){
        setLeadsData([]);
      }
      if (response.data.status_code === 200) {
        setLeadsData(response.data.data);
      }
    } catch (err) {
      console.error("error: ", err);
    }
  };

  const handleChange = ({ target: { name, checked } }) => {
    let updatedCheckedValues = {
      All: false,
      Pending: false,
      Shortlisted: false,
      Archived: false,
      Adopted: false,
    };

    if (name === "All" && checked) {
      updatedCheckedValues.All = true;
    } else if (checked) {
      updatedCheckedValues[name] = true;
    }

    setCheckedValues(updatedCheckedValues);

    if (name === "All" && checked) {
      fetchLeads();
    } else if (checked) {
      fillterLeads(name);
    } else {
      const isAnyFilterChecked =
        Object.values(updatedCheckedValues).includes(true);
      if (!isAnyFilterChecked) {
        fillterLeads();
      }
    }
    setDropdownVisible(!isDropdownVisible)
  };

  // Logic for pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = leadsData.slice(indexOfFirstPost, indexOfLastPost);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  function handleModel() {
    setDropdownVisible(!isDropdownVisible);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-showfilter") && 
          !event.target.closest(".dropdown-filterbtn")) {
        setDropdownVisible(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <>
    <BreederProtectedRoute>
      <div className="breedeerdasboard-profile-wrap">
        <div className="container">
          <div className="col-lg-12">
            <div className="breedeerdasboard-profile-inner">
              <BreederProfileLeft data={breederData} />

              <div className="leads-right">
                <form action="">
                  <div className="leads-inner-wrap">
                    <div className="filter-sec">
                      <div className="quotes2">
                        <div
                          className="dropdown-filterbtn"
                          onClick={handleModel}
                        >
                          Filter
                          <Image
                            src="/images/Nextpet-imgs/dashboard-imgs/mi_filter.svg"
                            alt=""
                            width={20}
                            height={20}
                          />
                        </div>
                        <div
                          className="dropdown-showfilter"
                          style={{
                            display: isDropdownVisible ? "block" : "none",
                          }}
                        >
                          <div className="quotes-list">
                            {[
                              "All",
                              "Pending",
                              "Shortlisted",
                              "Archived",
                              "Adopted",
                            ].map((option) => (
                              <div className="filter-data-list" key={option}>
                                <input
                                  type="checkbox"
                                  name={option}
                                  checked={checkedValues[option]}
                                  onChange={handleChange}
                                />
                                <p>
                                  {option.charAt(0).toUpperCase() +
                                    option.slice(1)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="leads-header-wrap">
                      <p>3 days ago</p>
                    </div>
                    <div className="leads-card-wrap">
                    {currentPosts?.length === 0 ? (
                        <h1 style={{ fontFamily:'GoodDog New', display:'flex', justifyContent:'center', width:'100%', padding:'50px 0'}}> No Leads Found...</h1>
                      ) : (
                        currentPosts?.map((lead, index) => (
                          <div key={index} className="leads-box">
                            <div className="image-circle">
                              <Image
                                src={lead?.user_image || "/images/Nextpet-imgs/contact-default.webp"}
                                alt="User Image"
                                width={200}
                                height={200} 
                              />
                            </div>
                            <div className="leads-content-wrap">
                              <div className="headinglead-wrap">
                                <h3>{lead?.user_name || "Account Deleted"}</h3>
                                <div className="rating-count">
                                  <span>
                                  {lead?.breeder_star_rating ? (Math.round(lead.breeder_star_rating * 10) / 10).toFixed(1) : 0.0}&nbsp; &nbsp;
                                    <FaStar
                                      style={{
                                        color: "white",
                                        marginBottom: "4px",
                                      }}
                                    />
                                  </span>
                                </div>
                              </div>
                              <h4>Interested in {lead?.pet_name}</h4>
                              <p>{lead?.pet_description}</p>
                              <div className="date-wrap">
                                <span>
                                  <GoClock
                                    style={{
                                      marginRight: "4px",
                                      marginBottom: "5px",
                                    }}
                                  />
                                  {lead?.created_at
                                    ? `${new Date(lead?.created_at).toLocaleDateString("en-US", {
                                        month: "2-digit",
                                        day: "2-digit",
                                        year: "numeric",
                                      })} | ${new Date(lead?.created_at).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      }).toLowerCase()}`
                                  : "Date not available"}

                                  <Link
                                    href={{
                                      pathname: `/breeder/contacted`,
                                      query: {
                                        user_id: lead?.user_id,
                                        post_id: lead?.post_id,
                                        breeder_id: lead?.breeder_id,
                                      },
                                    }}
                                  >
                                    <MdNavigateNext
                                      size={25}
                                      style={{ marginLeft: "30px" }}
                                    />
                                  </Link>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))) }
                    </div>

                    <div className="influ-pagi">
                      <Pagination
                        postPerPage={postsPerPage}
                        totalPosts={leadsData.length}
                        paginate={paginate}
                        currentPage={currentPage}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      </BreederProtectedRoute>
    </>
  );
};

export default Leads;
